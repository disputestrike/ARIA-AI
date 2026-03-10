// server/aria/memory.ts
// Session + persistent memory manager — reads/writes chatConversations table

import { eq, desc } from "drizzle-orm";
import { getDb } from "../db";
import { chatConversations } from "../../drizzle/schema";

export interface ARIAMemory {
  activeProductId?: number;
  brandVoiceId?: number;
  recentCampaignId?: number;
  recentContentIds?: number[];
  platformPreferences?: string[];
  lastBuildSummary?: string;
  messages?: Array<{ role: "user" | "assistant"; content: string }>;
}

export interface ToolResult {
  kind: string;
  status: "success" | "error";
  data: Record<string, unknown>;
  recordId?: number;
  message?: string;
}

export async function loadMemory(userId: number): Promise<ARIAMemory> {
  const db = await getDb();
  if (!db) return {};

  try {
    const rows = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.userId, userId))
      .orderBy(desc(chatConversations.updatedAt))
      .limit(1);

    if (rows.length === 0) return {};

    const row = rows[0];
    return {
      activeProductId: row.activeProductId ?? undefined,
      brandVoiceId: row.brandVoiceId ?? undefined,
      recentCampaignId: row.recentCampaignId ?? undefined,
      recentContentIds: (row.recentContentIds as number[]) ?? undefined,
      platformPreferences: (row.platformPreferences as string[]) ?? undefined,
      lastBuildSummary: row.lastBuildSummary ?? undefined,
      messages: (row.messages as Array<{ role: "user" | "assistant"; content: string }>) ?? [],
    };
  } catch (err) {
    console.error("[ARIA Memory] loadMemory error:", err);
    return {};
  }
}

export async function saveMemory(
  userId: number,
  prev: ARIAMemory,
  toolResults: ToolResult[],
  messages: Array<{ role: "user" | "assistant"; content: string }>
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Extract new IDs from tool results
    const newMemory: ARIAMemory = { ...prev, messages };

    for (const result of toolResults) {
      if (result.status !== "success" || !result.recordId) continue;

      switch (result.kind) {
        case "createCampaign":
          newMemory.recentCampaignId = result.recordId;
          break;
        case "generateContent":
        case "generateSocialPosts":
        case "generateSEOContent":
          newMemory.recentContentIds = [
            ...(newMemory.recentContentIds ?? []),
            result.recordId,
          ].slice(-10);
          break;
        case "analyzeProduct":
        case "getProductContext":
          if (result.data?.id) {
            newMemory.activeProductId = result.data.id as number;
          }
          break;
        case "getBrandVoice":
        case "generateBrandVoice":
          newMemory.brandVoiceId = result.recordId;
          break;
      }
    }

    // Build summary of what was built
    if (toolResults.length > 0) {
      const built = toolResults
        .filter((r) => r.status === "success")
        .map((r) => r.kind)
        .join(", ");
      newMemory.lastBuildSummary = built || prev.lastBuildSummary;
    }

    // Upsert into chatConversations
    const existing = await db
      .select()
      .from(chatConversations)
      .where(eq(chatConversations.userId, userId))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(chatConversations)
        .set({
          messages: newMemory.messages ?? [],
          activeProductId: newMemory.activeProductId ?? null,
          brandVoiceId: newMemory.brandVoiceId ?? null,
          recentCampaignId: newMemory.recentCampaignId ?? null,
          recentContentIds: newMemory.recentContentIds ?? null,
          platformPreferences: newMemory.platformPreferences ?? null,
          lastBuildSummary: newMemory.lastBuildSummary ?? null,
        })
        .where(eq(chatConversations.userId, userId));
    } else {
      await db.insert(chatConversations).values({
        userId,
        messages: newMemory.messages ?? [],
        activeProductId: newMemory.activeProductId ?? null,
        brandVoiceId: newMemory.brandVoiceId ?? null,
        recentCampaignId: newMemory.recentCampaignId ?? null,
        recentContentIds: newMemory.recentContentIds ?? null,
        platformPreferences: newMemory.platformPreferences ?? null,
        lastBuildSummary: newMemory.lastBuildSummary ?? null,
      });
    }
  } catch (err) {
    console.error("[ARIA Memory] saveMemory error:", err);
  }
}

export function buildMemoryContext(memory: ARIAMemory): string {
  const parts: string[] = [];

  if (memory.activeProductId) {
    parts.push(`Active product ID: ${memory.activeProductId}`);
  }
  if (memory.brandVoiceId) {
    parts.push(`Brand voice ID: ${memory.brandVoiceId}`);
  }
  if (memory.recentCampaignId) {
    parts.push(`Last campaign ID: ${memory.recentCampaignId}`);
  }
  if (memory.lastBuildSummary) {
    parts.push(`Last build: ${memory.lastBuildSummary}`);
  }

  if (parts.length === 0) return "";

  return `\n\n[Context: ${parts.join(", ")}]`;
}
