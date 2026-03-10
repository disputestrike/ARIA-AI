// server/aria/tools/dispatcher.ts
// Routes tool calls from the LLM to the correct implementation

import type { ToolResult } from "../memory";
import {
  analyzeProduct, getProductContext, analyzeWebsite, analyzeCompetitor,
  scrapeHooks, getBrandVoice,
} from "./understand";
import {
  createCampaign, generateContent, generateEmailSequence, generateSocialPosts,
  generateLandingPage, generateVideoScript, generateAdCreative, generateBrandVoice,
  createABTest, buildFunnel, buildAutomation, generateSEOContent, createLead, updateDeal,
} from "./build";
import {
  schedulePost, sendEmailCampaign, launchDSPCampaign, publishSocial,
  getAnalytics, getMomentum, scoreContent, generateSEOAudit, generateReport,
  replyToReview, predictPerformance,
} from "./publish";

type ToolArgs = Record<string, unknown>;

export async function dispatchTool(
  toolName: string,
  args: ToolArgs,
  userId: number
): Promise<ToolResult> {
  console.log(`[ARIA] Dispatching tool: ${toolName}`, JSON.stringify(args).substring(0, 200));

  try {
    switch (toolName) {
      // UNDERSTAND
      case "analyzeProduct":
        return await analyzeProduct(userId, args as Parameters<typeof analyzeProduct>[1]);
      case "getProductContext":
        return await getProductContext(userId, args as Parameters<typeof getProductContext>[1]);
      case "analyzeWebsite":
        return await analyzeWebsite(userId, args as Parameters<typeof analyzeWebsite>[1]);
      case "analyzeCompetitor":
        return await analyzeCompetitor(userId, args as Parameters<typeof analyzeCompetitor>[1]);
      case "scrapeHooks":
        return await scrapeHooks(userId, args as Parameters<typeof scrapeHooks>[1]);
      case "getBrandVoice":
        return await getBrandVoice(userId, args as Parameters<typeof getBrandVoice>[1]);

      // BUILD
      case "createCampaign":
        return await createCampaign(userId, args as Parameters<typeof createCampaign>[1]);
      case "generateContent":
        return await generateContent(userId, args as Parameters<typeof generateContent>[1]);
      case "generateEmailSequence":
        return await generateEmailSequence(userId, args as Parameters<typeof generateEmailSequence>[1]);
      case "generateSocialPosts":
        return await generateSocialPosts(userId, args as Parameters<typeof generateSocialPosts>[1]);
      case "generateLandingPage":
        return await generateLandingPage(userId, args as Parameters<typeof generateLandingPage>[1]);
      case "generateVideoScript":
        return await generateVideoScript(userId, args as Parameters<typeof generateVideoScript>[1]);
      case "generateAdCreative":
        return await generateAdCreative(userId, args as Parameters<typeof generateAdCreative>[1]);
      case "generateBrandVoice":
        return await generateBrandVoice(userId, args as Parameters<typeof generateBrandVoice>[1]);
      case "createABTest":
        return await createABTest(userId, args as Parameters<typeof createABTest>[1]);
      case "buildFunnel":
        return await buildFunnel(userId, args as Parameters<typeof buildFunnel>[1]);
      case "buildAutomation":
        return await buildAutomation(userId, args as Parameters<typeof buildAutomation>[1]);
      case "generateSEOContent":
        return await generateSEOContent(userId, args as Parameters<typeof generateSEOContent>[1]);
      case "createLead":
        return await createLead(userId, args as Parameters<typeof createLead>[1]);
      case "updateDeal":
        return await updateDeal(userId, args as Parameters<typeof updateDeal>[1]);

      // PUBLISH
      case "schedulePost":
        return await schedulePost(userId, args as Parameters<typeof schedulePost>[1]);
      case "sendEmailCampaign":
        return await sendEmailCampaign(userId, args as Parameters<typeof sendEmailCampaign>[1]);
      case "launchDSPCampaign":
        return await launchDSPCampaign(userId, args as Parameters<typeof launchDSPCampaign>[1]);
      case "publishSocial":
        return await publishSocial(userId, args as Parameters<typeof publishSocial>[1]);

      // ANALYZE
      case "getAnalytics":
        return await getAnalytics(userId, args as Parameters<typeof getAnalytics>[1]);
      case "getMomentum":
        return await getMomentum(userId, args as Parameters<typeof getMomentum>[1]);
      case "scoreContent":
        return await scoreContent(userId, args as Parameters<typeof scoreContent>[1]);
      case "generateSEOAudit":
        return await generateSEOAudit(userId, args as Parameters<typeof generateSEOAudit>[1]);
      case "generateReport":
        return await generateReport(userId, args as Parameters<typeof generateReport>[1]);
      case "replyToReview":
        return await replyToReview(userId, args as Parameters<typeof replyToReview>[1]);
      case "predictPerformance":
        return await predictPerformance(userId, args as Parameters<typeof predictPerformance>[1]);

      default:
        return {
          kind: toolName,
          status: "error",
          data: {},
          message: `Unknown tool: ${toolName}`,
        };
    }
  } catch (err) {
    console.error(`[ARIA] Tool ${toolName} threw:`, err);
    return {
      kind: toolName,
      status: "error",
      data: {},
      message: String(err),
    };
  }
}
