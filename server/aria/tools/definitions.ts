// server/aria/tools/definitions.ts
// All 32 ARIA tool definitions in OpenAI function-calling format

export const ARIA_TOOLS = [
  // ─── UNDERSTAND ──────────────────────────────────────────────────────────────
  {
    type: "function" as const,
    function: {
      name: "analyzeProduct",
      description: "Analyze a product's features, benefits, target audience, positioning, keywords, and competitive advantages. Call this first when a user mentions a product or URL.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "number", description: "Existing product ID to re-analyze" },
          url: { type: "string", description: "Product or website URL" },
          name: { type: "string", description: "Product name" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getProductContext",
      description: "Load full product context including features, benefits, audience, and keywords for a stored product.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "number", description: "Product ID to load" },
        },
        required: ["productId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "analyzeWebsite",
      description: "Perform deep website intelligence analysis: traffic estimates, demographics, SEO, social presence, content strategy, competitors, SWOT, budget recommendations.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "Website URL to analyze" },
          depth: { type: "string", enum: ["basic", "deep"], description: "Analysis depth" },
        },
        required: ["url"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "analyzeCompetitor",
      description: "Perform competitive intelligence analysis on a competitor website. Stores results for ongoing monitoring.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "Competitor website URL" },
          name: { type: "string", description: "Competitor name" },
        },
        required: ["url"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "scrapeHooks",
      description: "Generate viral hook variations for a topic or URL. Returns hooks with psychological triggers and platform recommendations.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL to generate hooks for" },
          topic: { type: "string", description: "Topic or product to generate hooks for" },
          count: { type: "number", description: "Number of hooks to generate (default 5)" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getBrandVoice",
      description: "Load the user's brand voice profile for use in content generation.",
      parameters: {
        type: "object",
        properties: {
          brandVoiceId: { type: "number", description: "Specific brand voice ID (optional, loads default if not provided)" },
        },
        additionalProperties: false,
      },
    },
  },

  // ─── BUILD ────────────────────────────────────────────────────────────────────
  {
    type: "function" as const,
    function: {
      name: "createCampaign",
      description: "Create a full marketing campaign with AI-generated strategy, posting schedule, audience targeting, budget allocation, and KPIs.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Campaign name" },
          objective: { type: "string", enum: ["awareness", "traffic", "engagement", "leads", "sales", "app_installs"], description: "Campaign objective" },
          platforms: { type: "array", items: { type: "string" }, description: "Target platforms" },
          productId: { type: "number", description: "Product ID to associate" },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "generateContent",
      description: "Generate any type of marketing content: ad copy, blog posts, social captions, email copy, video scripts, PR releases, Amazon listings, etc.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["ad_copy_short", "ad_copy_long", "blog_post", "seo_meta", "social_caption", "video_script", "email_copy", "pr_release", "podcast_script", "tv_script", "radio_script", "copywriting", "amazon_listing", "google_ads", "youtube_seo", "twitter_thread", "linkedin_article", "whatsapp_broadcast", "sms_copy", "story_content", "ugc_script", "landing_page"], description: "Content type" },
          topic: { type: "string", description: "Topic or product description" },
          platform: { type: "string", description: "Target platform" },
          productId: { type: "number", description: "Product ID" },
          campaignId: { type: "number", description: "Campaign ID" },
          brandVoiceId: { type: "number", description: "Brand voice ID" },
          language: { type: "string", description: "Language code (default: en)" },
          instruction: { type: "string", description: "Special instruction or angle" },
        },
        required: ["type"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "generateEmailSequence",
      description: "Generate a complete email sequence with multiple emails, each with subject, preview text, and full HTML body.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Sequence name" },
          topic: { type: "string", description: "Topic or product" },
          emailCount: { type: "number", description: "Number of emails (default 3)" },
          campaignId: { type: "number", description: "Campaign ID" },
          listId: { type: "number", description: "Email list ID" },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "generateSocialPosts",
      description: "Generate social media posts for multiple platforms at once.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Topic or product" },
          platforms: { type: "array", items: { type: "string" }, description: "Target platforms" },
          campaignId: { type: "number", description: "Campaign ID" },
          productId: { type: "number", description: "Product ID" },
          count: { type: "number", description: "Posts per platform (default 3)" },
        },
        required: ["topic"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "generateLandingPage",
      description: "Generate a complete landing page with headline, subheadline, body content, and CTA. Publishes immediately.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Landing page name" },
          topic: { type: "string", description: "Topic or product" },
          productId: { type: "number", description: "Product ID" },
          campaignId: { type: "number", description: "Campaign ID" },
          ctaText: { type: "string", description: "Call-to-action button text" },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "generateVideoScript",
      description: "Generate a video ad script with hook, full script, and CTA for a specific platform.",
      parameters: {
        type: "object",
        properties: {
          platform: { type: "string", enum: ["tiktok", "youtube", "reels", "youtube_shorts", "facebook", "snapchat", "pinterest"], description: "Video platform" },
          topic: { type: "string", description: "Topic or product" },
          productId: { type: "number", description: "Product ID" },
          campaignId: { type: "number", description: "Campaign ID" },
          adPreset: { type: "string", description: "Ad style preset (ugc_testimonial, product_demo, talking_head, etc.)" },
          emotion: { type: "string", enum: ["excited", "calm", "urgent", "friendly", "authoritative", "neutral", "empathetic", "surprised"], description: "Emotional tone" },
          duration: { type: "number", description: "Target duration in seconds" },
        },
        required: ["platform"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "generateAdCreative",
      description: "Generate AI image creatives for ads: ad images, social graphics, thumbnails, banners, stories.",
      parameters: {
        type: "object",
        properties: {
          type: { type: "string", enum: ["ad_image", "social_graphic", "thumbnail", "banner", "story", "product_photo", "meme", "ad_with_copy"], description: "Creative type" },
          topic: { type: "string", description: "Topic or product description for the image" },
          productId: { type: "number", description: "Product ID" },
          campaignId: { type: "number", description: "Campaign ID" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "generateBrandVoice",
      description: "Create a brand voice profile from sample content or description. Used for consistent tone across all generated content.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Brand voice name" },
          sampleContent: { type: "string", description: "Sample content to analyze for voice" },
          formalityLevel: { type: "string", enum: ["very_formal", "formal", "neutral", "casual", "very_casual"], description: "Formality level" },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "createABTest",
      description: "Create an A/B test with multiple variants for content, emails, or landing pages.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Test name" },
          type: { type: "string", description: "What is being tested (headline, cta, image, etc.)" },
          campaignId: { type: "number", description: "Campaign ID" },
          variantNames: { type: "array", items: { type: "string" }, description: "Variant names (default: Variant A, Variant B)" },
        },
        required: ["name", "type"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "buildFunnel",
      description: "Build a conversion funnel with multiple steps (landing, form, payment, thank you, upsell).",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Funnel name" },
          steps: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                name: { type: "string" },
              },
              required: ["type", "name"],
              additionalProperties: false,
            },
            description: "Funnel steps",
          },
          campaignId: { type: "number", description: "Campaign ID" },
          conversionGoal: { type: "string", description: "Conversion goal description" },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "buildAutomation",
      description: "Build a marketing automation workflow with trigger conditions and action sequences.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Workflow name" },
          trigger: {
            type: "object",
            properties: {
              type: { type: "string" },
              condition: { type: "string" },
            },
            required: ["type"],
            additionalProperties: false,
          },
          actions: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
              },
              required: ["type"],
              additionalProperties: false,
            },
          },
        },
        required: ["name", "trigger", "actions"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "generateSEOContent",
      description: "Generate SEO-optimized blog posts and content targeting specific keywords.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Content topic" },
          keywords: { type: "array", items: { type: "string" }, description: "Target keywords" },
          productId: { type: "number", description: "Product ID" },
          campaignId: { type: "number", description: "Campaign ID" },
        },
        required: ["topic"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "createLead",
      description: "Create a new lead in the CRM.",
      parameters: {
        type: "object",
        properties: {
          firstName: { type: "string" },
          lastName: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          company: { type: "string" },
          source: { type: "string" },
          campaignId: { type: "number" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "updateDeal",
      description: "Create or update a deal in the CRM pipeline.",
      parameters: {
        type: "object",
        properties: {
          dealId: { type: "number", description: "Existing deal ID to update" },
          name: { type: "string", description: "Deal name" },
          stage: { type: "string", enum: ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"] },
          valueCents: { type: "number", description: "Deal value in cents" },
          leadId: { type: "number", description: "Associated lead ID" },
        },
        additionalProperties: false,
      },
    },
  },

  // ─── PUBLISH ──────────────────────────────────────────────────────────────────
  {
    type: "function" as const,
    function: {
      name: "schedulePost",
      description: "Schedule a content piece to be published on a social platform at a specific time.",
      parameters: {
        type: "object",
        properties: {
          contentId: { type: "number", description: "Content ID to schedule" },
          platform: { type: "string", description: "Target platform" },
          scheduledAt: { type: "string", description: "ISO datetime string for scheduling" },
          campaignId: { type: "number", description: "Campaign ID" },
        },
        required: ["contentId", "platform"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "sendEmailCampaign",
      description: "Send or schedule an email campaign to a list.",
      parameters: {
        type: "object",
        properties: {
          emailCampaignId: { type: "number", description: "Email campaign ID to send" },
          listId: { type: "number", description: "Email list ID" },
          scheduledAt: { type: "string", description: "ISO datetime for scheduling (optional, sends immediately if not provided)" },
        },
        required: ["emailCampaignId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "launchDSPCampaign",
      description: "Launch a programmatic DSP advertising campaign. Requires sufficient wallet balance.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Campaign name" },
          dailyBudgetCents: { type: "number", description: "Daily budget in cents" },
          totalBudgetCents: { type: "number", description: "Total budget in cents" },
          targetingGeo: { type: "array", items: { type: "string" }, description: "Geographic targeting (country codes)" },
          campaignId: { type: "number", description: "Associated campaign ID" },
        },
        required: ["name", "dailyBudgetCents", "totalBudgetCents"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "publishSocial",
      description: "Immediately publish content to a social platform.",
      parameters: {
        type: "object",
        properties: {
          contentId: { type: "number", description: "Content ID to publish" },
          platform: { type: "string", description: "Target platform" },
          mediaUrls: { type: "array", items: { type: "string" }, description: "Media URLs to attach" },
        },
        required: ["contentId", "platform"],
        additionalProperties: false,
      },
    },
  },

  // ─── ANALYZE ──────────────────────────────────────────────────────────────────
  {
    type: "function" as const,
    function: {
      name: "getAnalytics",
      description: "Get analytics data: impressions, clicks, conversions, spend, revenue, CTR, ROAS.",
      parameters: {
        type: "object",
        properties: {
          campaignId: { type: "number", description: "Filter by campaign ID" },
          platform: { type: "string", description: "Filter by platform" },
          period: { type: "string", description: "Time period (today, week, month, all)" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "getMomentum",
      description: "Get AI-powered performance momentum analysis with trend, insights, and urgent action items.",
      parameters: {
        type: "object",
        properties: {
          campaignId: { type: "number", description: "Filter by campaign ID" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "scoreContent",
      description: "Score content quality on clarity, persuasiveness, engagement, and SEO strength with improvement suggestions.",
      parameters: {
        type: "object",
        properties: {
          contentId: { type: "number", description: "Content ID to score" },
        },
        required: ["contentId"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "generateSEOAudit",
      description: "Perform a full SEO audit with rank tracking, site structure analysis, and recommendations.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "URL to audit" },
          keywords: { type: "array", items: { type: "string" }, description: "Target keywords" },
        },
        required: ["url"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "generateReport",
      description: "Generate a shareable performance report with analytics summary and a public share link.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Report name" },
          campaignId: { type: "number", description: "Campaign ID to report on" },
        },
        required: ["name"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "replyToReview",
      description: "Generate and save an AI-powered reply to a customer review.",
      parameters: {
        type: "object",
        properties: {
          reviewId: { type: "number", description: "Review ID to reply to" },
          reviewContent: { type: "string", description: "Review text content" },
          platform: { type: "string", description: "Review platform (Google, Yelp, etc.)" },
          rating: { type: "number", description: "Star rating (1-5)" },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "predictPerformance",
      description: "Predict content or campaign performance: CTR, engagement, conversion probability, quality score.",
      parameters: {
        type: "object",
        properties: {
          contentId: { type: "number", description: "Content ID to predict for" },
          campaignId: { type: "number", description: "Campaign ID to predict for" },
        },
        additionalProperties: false,
      },
    },
  },
];
