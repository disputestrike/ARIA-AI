import axios from "axios";

export interface PublishInput {
  platform: "twitter" | "linkedin" | "facebook" | "instagram" | "email";
  content: string;
  title?: string;
  imageUrl?: string;
  scheduledFor?: Date;
  userId: string;
}

export interface PublishOutput {
  success: boolean;
  postId?: string;
  url?: string;
  error?: string;
}

// Twitter/X Publishing
export async function publishToTwitter(input: PublishInput): Promise<PublishOutput> {
  try {
    const twitterToken = process.env.TWITTER_API_KEY;
    if (!twitterToken) {
      throw new Error("Twitter API key not configured");
    }

    // Truncate to 280 characters for Twitter
    const content = input.content.substring(0, 280);

    // In production: use twitter-api-v2 library
    const response = await axios.post(
      "https://api.twitter.com/2/tweets",
      {
        text: content,
      },
      {
        headers: {
          Authorization: `Bearer ${twitterToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const postId = response.data.data?.id;

    return {
      success: true,
      postId,
      url: `https://twitter.com/i/web/status/${postId}`,
    };
  } catch (error) {
    console.error("Twitter publish error:", error);
    return {
      success: false,
      error: "Failed to publish to Twitter",
    };
  }
}

// LinkedIn Publishing
export async function publishToLinkedIn(input: PublishInput): Promise<PublishOutput> {
  try {
    const linkedinToken = process.env.LINKEDIN_ACCESS_TOKEN;
    if (!linkedinToken) {
      throw new Error("LinkedIn token not configured");
    }

    // In production: use linkedin-api library
    const response = await axios.post(
      "https://api.linkedin.com/v2/ugcPosts",
      {
        author: `urn:li:person:${input.userId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: {
              text: input.content,
            },
            shareMediaCategory: "ARTICLE",
            media: input.imageUrl
              ? [
                  {
                    status: "READY",
                    description: {
                      text: input.title || "Content",
                    },
                    originalUrl: input.imageUrl,
                  },
                ]
              : [],
          },
        },
        visibility: {
          "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
        },
      },
      {
        headers: {
          Authorization: `Bearer ${linkedinToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      postId: response.data.id,
      url: `https://www.linkedin.com/feed/update/${response.data.id}`,
    };
  } catch (error) {
    console.error("LinkedIn publish error:", error);
    return {
      success: false,
      error: "Failed to publish to LinkedIn",
    };
  }
}

// Facebook/Instagram Publishing
export async function publishToMeta(
  input: PublishInput
): Promise<PublishOutput> {
  try {
    const metaAccessToken = process.env.META_ACCESS_TOKEN;
    if (!metaAccessToken) {
      throw new Error("Meta access token not configured");
    }

    const endpoint =
      input.platform === "instagram"
        ? "https://graph.instagram.com/v18.0/{ig-user-id}/media"
        : "https://graph.facebook.com/v18.0/{page-id}/feed";

    // In production: use proper graph API
    const response = await axios.post(
      endpoint,
      {
        message: input.content,
        picture: input.imageUrl,
        access_token: metaAccessToken,
      }
    );

    return {
      success: true,
      postId: response.data.id,
      url: `https://facebook.com/${response.data.id}`,
    };
  } catch (error) {
    console.error("Meta publish error:", error);
    return {
      success: false,
      error: "Failed to publish to Facebook/Instagram",
    };
  }
}

// Email Publishing (via Resend)
export async function publishToEmail(input: PublishInput & { to: string[] }): Promise<PublishOutput> {
  try {
    const resendToken = process.env.RESEND_API_KEY;
    if (!resendToken) {
      throw new Error("Resend API key not configured");
    }

    const response = await axios.post(
      "https://api.resend.com/emails",
      {
        from: "noreply@aria.ai",
        to: input.to,
        subject: input.title || "Message from ARIA",
        html: input.content,
      },
      {
        headers: {
          Authorization: `Bearer ${resendToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      success: true,
      postId: response.data.id,
    };
  } catch (error) {
    console.error("Email publish error:", error);
    return {
      success: false,
      error: "Failed to send email",
    };
  }
}

// Schedule post for later
export async function schedulePost(input: PublishInput): Promise<PublishOutput> {
  try {
    if (!input.scheduledFor) {
      throw new Error("Schedule time required");
    }

    // In production: store in DB with scheduled job processor (Bull queue, etc)
    // For now: just return success
    console.log(`Post scheduled for ${input.scheduledFor.toISOString()}`);

    return {
      success: true,
      postId: `scheduled_${Date.now()}`,
    };
  } catch (error) {
    console.error("Schedule error:", error);
    return {
      success: false,
      error: "Failed to schedule post",
    };
  }
}

// Batch publish to multiple platforms
export async function publishToMultiple(
  input: PublishInput & { platforms: string[] }
): Promise<Record<string, PublishOutput>> {
  const results: Record<string, PublishOutput> = {};

  for (const platform of input.platforms) {
    try {
      switch (platform) {
        case "twitter":
          results.twitter = await publishToTwitter(input);
          break;
        case "linkedin":
          results.linkedin = await publishToLinkedIn(input);
          break;
        case "facebook":
        case "instagram":
          results[platform] = await publishToMeta({ ...input, platform: platform as any });
          break;
        default:
          results[platform] = {
            success: false,
            error: `Unknown platform: ${platform}`,
          };
      }
    } catch (error) {
      results[platform] = {
        success: false,
        error: `Error publishing to ${platform}`,
      };
    }
  }

  return results;
}
