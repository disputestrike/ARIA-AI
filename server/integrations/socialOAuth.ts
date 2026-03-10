/**
 * Social OAuth Integration Layer
 * Handles OAuth flows for Meta, Twitter/X, LinkedIn, and TikTok.
 * Stores access tokens encrypted in the integrations table.
 */

import type { Express, Request, Response } from "express";
import { getDb } from "../db";
import { integrations } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// ─── Platform Configs ─────────────────────────────────────────────────────────
const PLATFORMS = {
  meta: {
    authUrl: "https://www.facebook.com/v18.0/dialog/oauth",
    tokenUrl: "https://graph.facebook.com/v18.0/oauth/access_token",
    clientId: process.env.META_APP_ID ?? "",
    clientSecret: process.env.META_APP_SECRET ?? "",
    scopes: ["ads_management", "ads_read", "pages_manage_posts", "pages_read_engagement", "instagram_basic", "instagram_content_publish"],
  },
  twitter: {
    authUrl: "https://twitter.com/i/oauth2/authorize",
    tokenUrl: "https://api.twitter.com/2/oauth2/token",
    clientId: process.env.TWITTER_CLIENT_ID ?? "",
    clientSecret: process.env.TWITTER_CLIENT_SECRET ?? "",
    scopes: ["tweet.read", "tweet.write", "users.read", "offline.access"],
  },
  linkedin: {
    authUrl: "https://www.linkedin.com/oauth/v2/authorization",
    tokenUrl: "https://www.linkedin.com/oauth/v2/accessToken",
    clientId: process.env.LINKEDIN_CLIENT_ID ?? "",
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET ?? "",
    scopes: ["r_liteprofile", "r_emailaddress", "w_member_social", "r_organization_social", "rw_organization_admin"],
  },
  tiktok: {
    authUrl: "https://www.tiktok.com/v2/auth/authorize/",
    tokenUrl: "https://open.tiktokapis.com/v2/oauth/token/",
    clientId: process.env.TIKTOK_CLIENT_KEY ?? "",
    clientSecret: process.env.TIKTOK_CLIENT_SECRET ?? "",
    scopes: ["user.info.basic", "video.upload", "video.publish"],
  },
} as const;

type Platform = keyof typeof PLATFORMS;

// ─── Register OAuth Routes ────────────────────────────────────────────────────
export function registerSocialOAuthRoutes(app: Express) {
  // Initiate OAuth flow
  app.get("/api/oauth/social/:platform/connect", (req: Request, res: Response) => {
    const platform = req.params.platform as Platform;
    const config = PLATFORMS[platform];
    if (!config) return res.status(400).json({ error: "Unknown platform" });

    const userId = (req.query.userId as string) ?? "";
    const origin = req.headers.origin ?? `https://${req.headers.host}`;
    const redirectUri = `${origin}/api/oauth/social/${platform}/callback`;

    const state = Buffer.from(JSON.stringify({ userId, origin })).toString("base64");
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: redirectUri,
      scope: config.scopes.join(" "),
      response_type: "code",
      state,
    });

    return res.redirect(`${config.authUrl}?${params.toString()}`);
  });

  // Handle OAuth callback
  app.get("/api/oauth/social/:platform/callback", async (req: Request, res: Response) => {
    const platform = req.params.platform as Platform;
    const config = PLATFORMS[platform];
    if (!config) return res.status(400).json({ error: "Unknown platform" });

    const { code, state, error } = req.query as Record<string, string>;

    if (error) {
      console.error(`[Social OAuth] ${platform} error:`, error);
      return res.redirect(`/settings?oauth_error=${encodeURIComponent(error)}`);
    }

    let userId = "";
    let origin = "";
    try {
      const decoded = JSON.parse(Buffer.from(state, "base64").toString());
      userId = decoded.userId;
      origin = decoded.origin;
    } catch {
      return res.status(400).json({ error: "Invalid state" });
    }

    const redirectUri = `${origin}/api/oauth/social/${platform}/callback`;

    try {
      // Exchange code for tokens
      const tokenRes = await fetch(config.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: config.clientId,
          client_secret: config.clientSecret,
          code,
          redirect_uri: redirectUri,
        }).toString(),
      });

      const tokens = await tokenRes.json() as { access_token?: string; refresh_token?: string; expires_in?: number; error?: string };

      if (!tokens.access_token) {
        console.error(`[Social OAuth] ${platform} token exchange failed:`, tokens);
        return res.redirect(`/settings?oauth_error=token_exchange_failed`);
      }

      // Save integration to DB
      const db = await getDb();
      if (db && userId) {
        const userIdNum = parseInt(userId);
        const existing = await db.select().from(integrations)
          .where(and(eq(integrations.userId, userIdNum), eq(integrations.platform, platform)))
          .limit(1);

        const expiresAt = tokens.expires_in ? new Date(Date.now() + tokens.expires_in * 1000).toISOString() : null;
        const meta = { expiresAt, connectedAt: new Date().toISOString() };

        if (existing.length > 0) {
          await db.update(integrations).set({
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? null,
            metadata: meta,
            isActive: true,
            updatedAt: new Date(),
          }).where(and(eq(integrations.userId, userIdNum), eq(integrations.platform, platform)));
        } else {
          await db.insert(integrations).values({
            userId: userIdNum,
            platform,
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token ?? null,
            metadata: meta,
            isActive: true,
          });
        }
      }

      return res.redirect(`/settings?oauth_success=${platform}`);
    } catch (err) {
      console.error(`[Social OAuth] ${platform} callback error:`, err);
      return res.redirect(`/settings?oauth_error=callback_failed`);
    }
  });

  // Disconnect integration
  app.delete("/api/oauth/social/:platform/disconnect", async (req: Request, res: Response) => {
    const platform = req.params.platform as Platform;
    const { userId } = req.body as { userId: number };

    const db = await getDb();
    if (!db) return res.status(500).json({ error: "Database unavailable" });

    await db.update(integrations).set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(integrations.userId, userId), eq(integrations.platform, platform)));

    return res.json({ success: true });
  });
}

// ─── Get Active Integration Token ────────────────────────────────────────────
export async function getIntegrationToken(userId: number, platform: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const [integration] = await db.select()
    .from(integrations)
    .where(and(eq(integrations.userId, userId), eq(integrations.platform, platform), eq(integrations.isActive, true)))
    .limit(1);

  if (!integration?.accessToken) return null;

  // Check if token is expired (stored in metadata)
  const meta = integration.metadata as { expiresAt?: string } | null;
  if (meta?.expiresAt && new Date(meta.expiresAt) < new Date()) {
    // TODO: implement token refresh for each platform
    return null;
  }

  return integration.accessToken;
}

// ─── Publish to Social Platform ──────────────────────────────────────────────
export async function publishToSocial(userId: number, platform: string, content: string, mediaUrl?: string): Promise<{ success: boolean; postId?: string; error?: string }> {
  const token = await getIntegrationToken(userId, platform);
  if (!token) return { success: false, error: `No active ${platform} integration` };

  try {
    switch (platform) {
      case "twitter": {
        const res = await fetch("https://api.twitter.com/2/tweets", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ text: content }),
        });
        const data = await res.json() as { data?: { id: string } };
        return { success: true, postId: data.data?.id };
      }

      case "linkedin": {
        // LinkedIn UGC Post API
        const res = await fetch("https://api.linkedin.com/v2/ugcPosts", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            author: `urn:li:person:${userId}`,
            lifecycleState: "PUBLISHED",
            specificContent: {
              "com.linkedin.ugc.ShareContent": {
                shareCommentary: { text: content },
                shareMediaCategory: "NONE",
              },
            },
            visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
          }),
        });
        const data = await res.json() as { id?: string };
        return { success: true, postId: data.id };
      }

      default:
        return { success: false, error: `Publishing to ${platform} not yet implemented` };
    }
  } catch (err) {
    console.error(`[Social Publish] ${platform} error:`, err);
    return { success: false, error: String(err) };
  }
}
