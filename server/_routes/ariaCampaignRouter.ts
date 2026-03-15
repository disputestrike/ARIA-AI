import { z } from "zod";

interface TRPCContext {
  user?: {
    id: number;
    subscriptionTier: string;
  };
}

// Stub router setup with both mutation and query
const procedure = {
  input: (schema: any) => ({
    mutation: (fn: any) => ({}),
    query: (fn: any) => ({}),
  }),
  query: (fn: any) => ({}),
};
const router = (routes: any) => routes;

// Input schemas
const researchBrandInput = z.object({
  input: z.string(),
  entryPoint: z.enum(["new", "existing", "task", "clarify"]),
});

const generateCampaignInput = z.object({
  strategy: z.object({
    positioning: z.string(),
    audience: z.array(z.string()),
    channels: z.array(z.string()),
    tone: z.string(),
  }),
  selectedAssets: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      type: z.string(),
    })
  ),
  campaignName: z.string(),
});

const analyzeWebsiteInput = z.object({
  url: z.string().url(),
});

// Campaign router
export const ariaCampaignRouter = router({
  // MUTATION: Research brand and get strategy
  researchBrand: procedure
    .input(researchBrandInput)
    .mutation(async ({ input }: { input: z.infer<typeof researchBrandInput> }) => {
      try {
        // Call strategy agent
        const strategy = await strategyAgent({
          userInput: input.input,
          entryPoint: input.entryPoint,
        });

        return {
          success: true,
          data: strategy,
        };
      } catch (error) {
        console.error("Research brand error:", error);
        return {
          success: false,
          error: "Failed to research brand",
        };
      }
    }),

  // MUTATION: Generate full campaign
  generateCampaign: procedure
    .input(generateCampaignInput)
    .mutation(async ({ input, ctx }: { input: z.infer<typeof generateCampaignInput>; ctx: any }) => {
      const startTime = Date.now();

      try {
        // Validate user tier and campaign limit
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        // Check campaign limit (would query database in real implementation)
        // const userCampaigns = await db.project.count({
        //   where: { userId: ctx.user.id },
        // });
        // if (userCampaigns >= TIER_LIMITS[ctx.user.subscriptionTier]) {
        //   throw new Error("Campaign limit reached");
        // }

        // Generate assets in parallel (simulated DAG execution)
        const assetPromises = input.selectedAssets.map(asset =>
          generateAsset({
            assetType: asset.type as any,
            strategy: input.strategy,
            context: input.campaignName,
          }).catch(err => ({
            type: asset.type,
            title: asset.name,
            content: `[Error generating ${asset.name}]`,
            metadata: { tokens: 0, sections: 0 },
          }))
        );

        const generatedAssets = await Promise.all(assetPromises);
        const endTime = Date.now();

        // Return campaign with assets
        return {
          success: true,
          data: {
            campaignId: `campaign_${Date.now()}`,
            campaignName: input.campaignName,
            score: 82,
            assets: generatedAssets,
            generationTime: endTime - startTime,
            tokens: generatedAssets.reduce((sum, a) => sum + a.metadata.tokens, 0),
          },
        };
      } catch (error) {
        console.error("Generate campaign error:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Failed to generate campaign",
        };
      }
    }),

  // QUERY: Analyze website for existing brand
  analyzeWebsite: procedure
    .input(analyzeWebsiteInput)
    .query(async ({ input }) => {
      try {
        const analysis = await analyzeWebsite({
          url: input.url,
        });

        return {
          success: true,
          data: analysis,
        };
      } catch (error) {
        console.error("Analyze website error:", error);
        return {
          success: false,
          error: "Failed to analyze website",
        };
      }
    }),

  // MUTATION: Save campaign to database
  saveCampaign: procedure
    .input(
      z.object({
        campaignName: z.string(),
        assets: z.array(
          z.object({
            type: z.string(),
            title: z.string(),
            content: z.string(),
            status: z.enum(["draft", "approved", "scheduled", "published"]),
          })
        ),
        score: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        // Save to database (would be actual DB call)
        // const project = await db.project.create({
        //   data: {
        //     name: input.campaignName,
        //     userId: ctx.user.id,
        //     score: input.score,
        //     assets: {
        //       create: input.assets,
        //     },
        //   },
        // });

        return {
          success: true,
          campaignId: `campaign_${Date.now()}`,
          message: "Campaign saved successfully",
        };
      } catch (error) {
        console.error("Save campaign error:", error);
        return {
          success: false,
          error: "Failed to save campaign",
        };
      }
    }),

  // MUTATION: Regenerate single asset
  regenerateAsset: procedure
    .input(
      z.object({
        assetId: z.string(),
        assetType: z.string(),
        campaignId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        // Regenerate asset (would fetch campaign context from DB)
        const newAsset = await generateAsset({
          assetType: input.assetType as any,
          strategy: {
            positioning: "Regenerated version",
            targetAudience: [],
            tone: "professional",
          },
        });

        return {
          success: true,
          data: newAsset,
        };
      } catch (error) {
        console.error("Regenerate asset error:", error);
        return {
          success: false,
          error: "Failed to regenerate asset",
        };
      }
    }),

  // QUERY: Get campaign by ID
  getCampaign: procedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input, ctx }) => {
      try {
        if (!ctx.user) {
          throw new Error("Unauthorized");
        }

        // Fetch from DB (stub)
        // const campaign = await db.project.findUnique({
        //   where: { id: input.campaignId },
        //   include: { assets: true },
        // });

        return {
          success: true,
          data: {
            id: input.campaignId,
            name: "Sample Campaign",
            score: 85,
            assets: [],
          },
        };
      } catch (error) {
        console.error("Get campaign error:", error);
        return {
          success: false,
          error: "Campaign not found",
        };
      }
    }),

  // QUERY: List user's campaigns
  listCampaigns: procedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        throw new Error("Unauthorized");
      }

      // Fetch from DB (stub)
      // const campaigns = await db.project.findMany({
      //   where: { userId: ctx.user.id },
      //   orderBy: { createdAt: "desc" },
      //   take: 20,
      // });

      return {
        success: true,
        data: [],
      };
    } catch (error) {
      console.error("List campaigns error:", error);
      return {
        success: false,
        error: "Failed to list campaigns",
      };
    }
  }),
});
