import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

async function exchangeGoogleCodeForToken(code: string, redirectUri: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Google OAuth credentials not configured");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google token exchange failed: ${response.statusText}`);
  }

  return response.json();
}

async function getGoogleUserInfo(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google user info: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    openId: data.sub,
    email: data.email,
    name: data.name,
    loginMethod: "google",
  };
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const error = getQueryParam(req, "error");

    // Handle OAuth errors from Google
    if (error) {
      console.error("[OAuth] Google returned error:", error);
      return res.redirect(302, `/?error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return res.status(400).json({ error: "code and state are required" });
    }

    try {
      // Decode redirect URI from state
      const redirectUri = Buffer.from(state, "base64").toString("utf-8");
      
      // Exchange Google auth code for access token
      const tokenData = await exchangeGoogleCodeForToken(code, redirectUri);
      
      // Get user info from Google
      const userInfo = await getGoogleUserInfo(tokenData.access_token);

      // Create/update user in database
      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email || null,
        loginMethod: userInfo.loginMethod,
        lastSignedIn: new Date(),
      });

      // Create session token
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      // Set session cookie and redirect home
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed:", error);
      res.redirect(302, `/?error=${encodeURIComponent("Authentication failed")}`);
    }
  });
}

