import { strategyAgent, StrategyOutput } from "../_agents/strategyAgent";
import { generateAsset, AssetType } from "../_agents/assetGenerationAgent";
import { analyzeWebsite } from "../_agents/websiteIntelligenceAgent";

export interface CampaignExecutionPlan {
  campaignId: string;
  stages: CampaignStage[];
  estimatedDuration: number; // seconds
  estimatedTokens: number;
}

export interface CampaignStage {
  name: string;
  agent: string;
  dependencies: string[];
  inputs: Record<string, any>;
  status: "pending" | "running" | "complete" | "error";
  output?: any;
  error?: string;
  duration: number;
}

export interface AgentProgress {
  stage: string;
  status: "running" | "complete" | "error";
  progress: number; // 0-100
  output?: any;
}

/**
 * Orchestrates the campaign generation DAG
 * Entry Point 1: Full Campaign → Research → Checklist → Parallel asset generation
 * Entry Point 2: Existing Brand → Load brand kit → Show missing → Generate missing only
 * Entry Point 3: Specific Task → Direct execution → Single asset
 */
export class CampaignOrchestrator {
  private campaignId: string;
  private stages: Map<string, CampaignStage> = new Map();
  private progressCallbacks: Array<(progress: AgentProgress) => void> = [];

  constructor(campaignId: string) {
    this.campaignId = campaignId;
  }

  /**
   * Full Campaign Flow (Entry Point 1)
   */
  async executeFullCampaign(input: {
    userInput: string;
    selectedAssets: { type: string; name: string }[];
    campaignName: string;
    brandKit?: any;
  }): Promise<CampaignExecutionPlan> {
    const plan: CampaignExecutionPlan = {
      campaignId: this.campaignId,
      stages: [],
      estimatedDuration: 0,
      estimatedTokens: 0,
    };

    // Stage 1: Strategy Agent (Research)
    const strategyStage: CampaignStage = {
      name: "Strategy Analysis",
      agent: "StrategyAgent",
      dependencies: [],
      inputs: { userInput: input.userInput },
      status: "pending",
      duration: 0,
    };
    this.stages.set("strategy", strategyStage);
    plan.stages.push(strategyStage);

    // Stage 2: Website Analysis (if domain detected)
    const analysisStage: CampaignStage = {
      name: "Website Analysis",
      agent: "WebsiteIntelligenceAgent",
      dependencies: ["strategy"],
      inputs: {},
      status: "pending",
      duration: 0,
    };
    this.stages.set("analysis", analysisStage);
    plan.stages.push(analysisStage);

    // Stage 3: Asset Generation (Parallel)
    for (const asset of input.selectedAssets) {
      const assetStage: CampaignStage = {
        name: `Generate: ${asset.name}`,
        agent: "AssetGenerationAgent",
        dependencies: ["strategy"],
        inputs: { assetType: asset.type },
        status: "pending",
        duration: 0,
      };
      this.stages.set(`asset_${asset.type}`, assetStage);
      plan.stages.push(assetStage);
    }

    // Execute the DAG
    await this.executePlan(plan);

    return plan;
  }

  /**
   * Existing Brand Flow (Entry Point 2)
   */
  async executeExistingBrand(input: {
    website: string;
    missingAssets: { type: string; name: string }[];
    brandKit: any;
  }): Promise<CampaignExecutionPlan> {
    const plan: CampaignExecutionPlan = {
      campaignId: this.campaignId,
      stages: [],
      estimatedDuration: 0,
      estimatedTokens: 0,
    };

    // Skip research - we already have brand
    // Stage 1: Analyze website
    const analysisStage: CampaignStage = {
      name: "Website Analysis",
      agent: "WebsiteIntelligenceAgent",
      dependencies: [],
      inputs: { url: input.website },
      status: "pending",
      duration: 0,
    };
    this.stages.set("analysis", analysisStage);
    plan.stages.push(analysisStage);

    // Stage 2: Generate only missing assets
    for (const asset of input.missingAssets) {
      const assetStage: CampaignStage = {
        name: `Generate: ${asset.name}`,
        agent: "AssetGenerationAgent",
        dependencies: ["analysis"],
        inputs: { assetType: asset.type, brandKit: input.brandKit },
        status: "pending",
        duration: 0,
      };
      this.stages.set(`asset_${asset.type}`, assetStage);
      plan.stages.push(assetStage);
    }

    await this.executePlan(plan);

    return plan;
  }

  /**
   * Specific Task Flow (Entry Point 3)
   */
  async executeSpecificTask(input: {
    assetType: string;
    briefText: string;
    brandKit?: any;
  }): Promise<CampaignExecutionPlan> {
    const plan: CampaignExecutionPlan = {
      campaignId: this.campaignId,
      stages: [],
      estimatedDuration: 5, // Quick
      estimatedTokens: 1000,
    };

    // Direct execution - no research needed
    const assetStage: CampaignStage = {
      name: `Generate: ${input.assetType}`,
      agent: "AssetGenerationAgent",
      dependencies: [],
      inputs: {
        assetType: input.assetType,
        context: input.briefText,
        brandKit: input.brandKit,
      },
      status: "pending",
      duration: 0,
    };
    this.stages.set("asset", assetStage);
    plan.stages.push(assetStage);

    await this.executePlan(plan);

    return plan;
  }

  /**
   * Execute the DAG plan (handles dependencies, parallelization)
   */
  private async executePlan(plan: CampaignExecutionPlan): Promise<void> {
    const completed = new Set<string>();
    let totalDuration = 0;
    let totalTokens = 0;

    while (completed.size < plan.stages.length) {
      // Find stages that can run (all dependencies complete)
      const readyStages = plan.stages.filter(stage => {
        if (completed.has(stage.name)) return false;
        return stage.dependencies.every(dep => completed.has(dep));
      });

      if (readyStages.length === 0 && completed.size < plan.stages.length) {
        throw new Error("Circular dependency or missing stage");
      }

      // Execute ready stages in parallel
      const promises = readyStages.map(stage =>
        this.executeStage(stage, completed, totalDuration, totalTokens)
      );

      const results = await Promise.allSettled(promises);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        const stage = readyStages[i];

        if (result.status === "fulfilled") {
          const { duration, tokens } = result.value;
          stage.status = "complete";
          stage.duration = duration;
          totalDuration = Math.max(totalDuration, duration);
          totalTokens += tokens;
          completed.add(stage.name);
        } else {
          stage.status = "error";
          stage.error = result.reason?.message || "Unknown error";
          completed.add(stage.name);
        }
      }
    }

    plan.estimatedDuration = totalDuration;
    plan.estimatedTokens = totalTokens;
  }

  /**
   * Execute a single stage (agent call)
   */
  private async executeStage(
    stage: CampaignStage,
    completed: Set<string>,
    totalDuration: number,
    totalTokens: number
  ): Promise<{ duration: number; tokens: number }> {
    const startTime = Date.now();
    this.emitProgress({
      stage: stage.name,
      status: "running",
      progress: 50,
    });

    try {
      let output: any;
      let tokens = 0;

      switch (stage.agent) {
        case "StrategyAgent":
          output = await strategyAgent({
            userInput: stage.inputs.userInput,
            entryPoint: "new",
          });
          tokens = 500; // Rough estimate
          break;

        case "AssetGenerationAgent":
          output = await generateAsset({
            assetType: stage.inputs.assetType,
            strategy: stage.inputs.strategy || {
              positioning: "Professional",
              targetAudience: [],
              tone: "Professional",
            },
            brandKit: stage.inputs.brandKit,
          });
          tokens = output.metadata?.tokens || 1000;
          break;

        case "WebsiteIntelligenceAgent":
          output = await analyzeWebsite({
            url: stage.inputs.url,
          });
          tokens = 800;
          break;

        default:
          throw new Error(`Unknown agent: ${stage.agent}`);
      }

      stage.output = output;
      const duration = Date.now() - startTime;

      this.emitProgress({
        stage: stage.name,
        status: "complete",
        progress: 100,
        output,
      });

      return { duration, tokens };
    } catch (error) {
      const duration = Date.now() - startTime;

      this.emitProgress({
        stage: stage.name,
        status: "error",
        progress: 0,
      });

      throw error;
    }
  }

  /**
   * Register progress listener
   */
  onProgress(callback: (progress: AgentProgress) => void): void {
    this.progressCallbacks.push(callback);
  }

  /**
   * Emit progress to all listeners
   */
  private emitProgress(progress: AgentProgress): void {
    this.progressCallbacks.forEach(callback => callback(progress));
  }

  /**
   * Get current status
   */
  getStatus(): {
    stages: CampaignStage[];
    progress: number; // 0-100
    estimatedTime: number;
  } {
    const stages = Array.from(this.stages.values());
    const completed = stages.filter(s => s.status === "complete").length;
    const progress = (completed / stages.length) * 100;

    return {
      stages,
      progress,
      estimatedTime: 20, // seconds
    };
  }
}
