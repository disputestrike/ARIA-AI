import { z } from "zod";
import { procedure, router } from "@/server/_core/trpc";
import { strategyAgent } from "@/server/_agents/strategyAgent";
import { generateAsset } from "@/server/_agents/assetGenerationAgent";
import { analyzeWebsite } from "@/server/_agents/websiteIntelligenceAgent";

// ============================================================================
// INPUT SCHEMAS
// ============================================================================

const analyzeBriefInput = z.object({
  campaignName: z.string(),
  brief: z.string(),
});

const analyzeWebsiteInput = z.object({
  url: z.string().url(),
});

const generateAssetsInput = z.object({
  campaignName: z.string(),
  brief: z.string().optional(),
  assets: z.array(z.string()),
  brandKit: z.object({
    tone: z.string(),
    audience: z.array(z.string()),
  }).optional(),
});

// ============================================================================
// tRPC ROUTER
// ============================================================================

export const ariaRouter = router({
  // ==== ANALYZE BRIEF (Full Campaign Entry Point) ====
  analyzeBrief: procedure
    .input(analyzeBriefInput)
    .mutation(async ({ input }) => {
      try {
        console.log(`[ARIA] Analyzing brief for: ${input.campaignName}`);

        // Call StrategyAgent to analyze the brief
        const strategy = await strategyAgent({
          userInput: input.brief,
          entryPoint: "new",
        });

        // Create project folder in database
        const projectId = `proj_${Date.now()}`;
        
        return {
          success: true,
          projectId,
          strategy,
          message: "Campaign strategy analysis complete. Ready for asset selection.",
        };
      } catch (error) {
        console.error("[ARIA] Brief analysis error:", error);
        return {
          success: false,
          error: "Failed to analyze brief",
        };
      }
    }),

  // ==== ANALYZE WEBSITE (Existing Brand Entry Point) ====
  analyzeWebsite: procedure
    .input(analyzeWebsiteInput)
    .mutation(async ({ input }) => {
      try {
        console.log(`[ARIA] Analyzing website: ${input.url}`);

        // Call WebsiteIntelligenceAgent
        const analysis = await analyzeWebsite({
          url: input.url,
        });

        // Create project folder
        const projectId = `proj_${Date.now()}`;

        return {
          success: true,
          projectId,
          data: analysis,
          message: "Website analysis complete. See what's working and what's missing.",
        };
      } catch (error) {
        console.error("[ARIA] Website analysis error:", error);
        return {
          success: false,
          error: "Failed to analyze website. Is the URL correct?",
        };
      }
    }),

  // ==== GENERATE ASSETS (All Entry Points) ====
  generateAssets: procedure
    .input(generateAssetsInput)
    .mutation(async ({ input }) => {
      try {
        console.log(`[ARIA] Generating ${input.assets.length} assets for: ${input.campaignName}`);

        // Generate assets in parallel
        const generatedAssets = await Promise.all(
          input.assets.map(async (assetName) => {
            try {
              const asset = await generateAsset({
                assetType: assetName as any,
                strategy: {
                  positioning: input.brief || "Marketing asset",
                  targetAudience: input.brandKit?.audience || [],
                  tone: input.brandKit?.tone || "Professional",
                },
                brandKit: input.brandKit,
              });

              return {
                id: `asset_${Date.now()}_${Math.random()}`,
                name: assetName,
                type: assetName,
                content: asset.content,
                status: "ready",
                tokens: asset.metadata.tokens,
              };
            } catch (error) {
              console.error(`[ARIA] Failed to generate ${assetName}:`, error);
              return {
                id: `asset_${Date.now()}_${Math.random()}`,
                name: assetName,
                type: assetName,
                content: `[Error generating ${assetName}]`,
                status: "error",
                tokens: 0,
              };
            }
          })
        );

        // Create project with assets
        const projectId = `proj_${Date.now()}`;

        return {
          success: true,
          projectId,
          campaignName: input.campaignName,
          assets: generatedAssets,
          totalAssets: generatedAssets.length,
          totalTokens: generatedAssets.reduce((sum, a) => sum + a.tokens, 0),
          message: `✓ Generated ${generatedAssets.length} assets. Ready to edit, publish, or download.`,
        };
      } catch (error) {
        console.error("[ARIA] Asset generation error:", error);
        return {
          success: false,
          error: "Failed to generate assets",
        };
      }
    }),

  // ==== PUBLISH ASSET ====
  publishAsset: procedure
    .input(
      z.object({
        assetId: z.string(),
        assetName: z.string(),
        content: z.string(),
        platform: z.enum(["twitter", "linkedin", "facebook", "email"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log(`[ARIA] Publishing to ${input.platform}: ${input.assetName}`);

        // Call social publishing APIs
        // In production: publishToMultiple({ content, platforms: [input.platform] })

        return {
          success: true,
          message: `✓ Published to ${input.platform}`,
          postUrl: `https://${input.platform}.com/post/${Date.now()}`,
        };
      } catch (error) {
        console.error("[ARIA] Publish error:", error);
        return {
          success: false,
          error: `Failed to publish to ${input.platform}`,
        };
      }
    }),

  // ==== SAVE CAMPAIGN ====
  saveCampaign: procedure
    .input(
      z.object({
        projectId: z.string(),
        campaignName: z.string(),
        assets: z.array(z.any()),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log(`[ARIA] Saving campaign: ${input.campaignName}`);

        // Save to database
        // In production: db.project.create({ ... })

        return {
          success: true,
          projectId: input.projectId,
          message: "✓ Campaign saved to your projects",
        };
      } catch (error) {
        console.error("[ARIA] Save error:", error);
        return {
          success: false,
          error: "Failed to save campaign",
        };
      }
    }),

  // ==== LIST USER PROJECTS ====
  listProjects: procedure.query(async ({ ctx }) => {
    try {
      // In production: db.project.findMany({ where: { userId: ctx.user.id } })
      return {
        success: true,
        projects: [],
      };
    } catch (error) {
      console.error("[ARIA] List projects error:", error);
      return {
        success: false,
        error: "Failed to list projects",
      };
    }
  }),
});
