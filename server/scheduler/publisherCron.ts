/**
 * Publisher Scheduler — Cron Job
 * Runs every 15 minutes to process the scheduled posts queue.
 * Publishes content to social platforms at the scheduled time.
 */

import { getDb } from "../db";
import { scheduledPosts, contents } from "../../drizzle/schema";
import { eq, and, lte } from "drizzle-orm";
import { publishToSocial } from "../integrations/socialOAuth";

let isRunning = false;

// ─── Process Queue ────────────────────────────────────────────────────────────
export async function processPublishQueue(): Promise<{ processed: number; failed: number; skipped: number }> {
  if (isRunning) {
    console.log("[Scheduler] Queue processing already in progress — skipping");
    return { processed: 0, failed: 0, skipped: 1 };
  }

  isRunning = true;
  let processed = 0;
  let failed = 0;

  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Scheduler] Database not available");
      return { processed: 0, failed: 0, skipped: 1 };
    }

    const now = new Date();

    // Get all pending posts scheduled for now or earlier
    const pendingPosts = await db
      .select()
      .from(scheduledPosts)
      .where(
        and(
          eq(scheduledPosts.status, "pending"),
          lte(scheduledPosts.scheduledAt, now)
        )
      )
      .limit(50); // Process max 50 per run to avoid overload

    console.log(`[Scheduler] Found ${pendingPosts.length} posts to publish`);

    for (const post of pendingPosts) {
      try {
        // Mark as processing (use pending while processing to avoid enum issue)
        // scheduledPosts has no 'processing' status — skip status update here

        // Get the content
        let contentText = ""; // caption not in schema — use contentId

        if (post.contentId) {
          const [content] = await db.select().from(contents)
            .where(eq(contents.id, post.contentId))
            .limit(1);
          if (content?.body) {
            contentText = content.body;
          }
        }

        if (!contentText) {
          console.warn(`[Scheduler] Post ${post.id} has no content — skipping`);
          await db.update(scheduledPosts)
            .set({ status: "failed", errorMessage: "No content to publish" })
            .where(eq(scheduledPosts.id, post.id));
          failed++;
          continue;
        }

        // Publish to social platform
        const result = await publishToSocial(
          post.userId,
          post.platform,
          contentText
        );

        if (result.success) {
          await db.update(scheduledPosts)
            .set({
              status: "published",
              publishedAt: new Date(),
            })
            .where(eq(scheduledPosts.id, post.id));

          // Update content status if linked
          if (post.contentId) {
            await db.update(contents)
              .set({ status: "published" })
              .where(eq(contents.id, post.contentId));
          }

          processed++;
          console.log(`[Scheduler] Published post ${post.id} to ${post.platform} — external ID: ${result.postId}`);
        } else {
          await db.update(scheduledPosts)
            .set({
              status: "failed",
              errorMessage: result.error ?? "Unknown error",
            })
            .where(eq(scheduledPosts.id, post.id));

          failed++;
          console.error(`[Scheduler] Failed to publish post ${post.id}: ${result.error}`);
        }
      } catch (err) {
        console.error(`[Scheduler] Error processing post ${post.id}:`, err);
        await db.update(scheduledPosts)
          .set({
            status: "failed",
            errorMessage: String(err),
          })
          .where(eq(scheduledPosts.id, post.id));
        failed++;
      }
    }

    console.log(`[Scheduler] Queue run complete — processed: ${processed}, failed: ${failed}`);
    return { processed, failed, skipped: 0 };
  } finally {
    isRunning = false;
  }
}

// ─── Start Cron Job ───────────────────────────────────────────────────────────
let cronInterval: ReturnType<typeof setInterval> | null = null;

export function startPublisherCron(intervalMs = 15 * 60 * 1000): void {
  if (cronInterval) {
    console.warn("[Scheduler] Cron already running");
    return;
  }

  console.log(`[Scheduler] Starting publisher cron — interval: ${intervalMs / 1000}s`);

  // Run immediately on start
  processPublishQueue().catch(err => console.error("[Scheduler] Initial run failed:", err));

  // Then run on interval
  cronInterval = setInterval(() => {
    processPublishQueue().catch(err => console.error("[Scheduler] Cron run failed:", err));
  }, intervalMs);
}

export function stopPublisherCron(): void {
  if (cronInterval) {
    clearInterval(cronInterval);
    cronInterval = null;
    console.log("[Scheduler] Publisher cron stopped");
  }
}
