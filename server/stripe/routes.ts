import Stripe from "stripe";
import type { Express, Request, Response } from "express";
import { getDb } from "../db";
import { subscriptions, users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { ARIA_PLANS, getPlanByPriceId } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-02-25.clover",
});

export function registerStripeRoutes(app: Express) {
  // ─── Webhook (must be before express.json middleware) ──────────────────────
  app.post(
    "/api/stripe/webhook",
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string;
      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body as Buffer,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET ?? ""
        );
      } catch (err) {
        console.error("[Stripe Webhook] Signature verification failed:", err);
        return res.status(400).send("Webhook signature verification failed");
      }

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Stripe Webhook] Event: ${event.type} | ID: ${event.id}`);

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            await handleCheckoutCompleted(session);
            break;
          }
          case "customer.subscription.updated":
          case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            await handleSubscriptionChange(sub);
            break;
          }
          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            console.log(`[Stripe] Payment failed for customer: ${invoice.customer}`);
            break;
          }
        }
      } catch (err) {
        console.error("[Stripe Webhook] Handler error:", err);
        return res.status(500).json({ error: "Webhook handler failed" });
      }

      return res.json({ received: true });
    }
  );

  // ─── Create Checkout Session ───────────────────────────────────────────────
  app.post("/api/stripe/create-checkout", async (req: Request, res: Response) => {
    try {
      const { priceId, userId, userEmail, userName, billingInterval } = req.body as {
        priceId: string;
        userId: number;
        userEmail: string;
        userName: string;
        billingInterval: "monthly" | "yearly";
      };

      const origin = req.headers.origin ?? `https://${req.headers.host}`;

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        customer_email: userEmail,
        allow_promotion_codes: true,
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: userId.toString(),
        metadata: {
          user_id: userId.toString(),
          customer_email: userEmail,
          customer_name: userName,
          billing_interval: billingInterval,
        },
        success_url: `${origin}/billing?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/billing?canceled=true`,
      });

      return res.json({ url: session.url });
    } catch (err) {
      console.error("[Stripe] Create checkout error:", err);
      return res.status(500).json({ error: "Failed to create checkout session" });
    }
  });

  // ─── Create Customer Portal Session ───────────────────────────────────────
  app.post("/api/stripe/portal", async (req: Request, res: Response) => {
    try {
      const { customerId } = req.body as { customerId: string };
      const origin = req.headers.origin ?? `https://${req.headers.host}`;

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${origin}/billing`,
      });

      return res.json({ url: session.url });
    } catch (err) {
      console.error("[Stripe] Portal session error:", err);
      return res.status(500).json({ error: "Failed to create portal session" });
    }
  });
}

// ─── Webhook Handlers ──────────────────────────────────────────────────────────
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = parseInt(session.client_reference_id ?? "0");
  if (!userId) return;

  const db = await getDb();
  if (!db) return;

  // Retrieve the subscription from Stripe
  const stripeSubId = session.subscription as string;
  if (!stripeSubId) return;

  const stripeSub = await stripe.subscriptions.retrieve(stripeSubId);
  const priceId = stripeSub.items.data[0]?.price.id ?? "";
  const planEntry = getPlanByPriceId(priceId);
  const dbTier = planEntry ? ARIA_PLANS[planEntry].dbTier : "starter";
  const customerId = session.customer as string;
  const periodStart = (stripeSub as unknown as { current_period_start?: number }).current_period_start;
  const periodEnd = (stripeSub as unknown as { current_period_end?: number }).current_period_end;

  // Upsert subscription record
  const existing = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);

  if (existing.length > 0) {
    await db.update(subscriptions).set({
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubId,
      tier: dbTier,
      status: "active",
      currentPeriodStart: periodStart ? new Date(periodStart * 1000) : undefined,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
      updatedAt: new Date(),
    }).where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({
      userId,
      stripeCustomerId: customerId,
      stripeSubscriptionId: stripeSubId,
      tier: dbTier,
      status: "active",
      currentPeriodStart: periodStart ? new Date(periodStart * 1000) : undefined,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
    });
  }

  // Update user's stripe customer ID
  await db.update(users).set({ stripeCustomerId: customerId } as Partial<typeof users.$inferInsert>).where(eq(users.id, userId));

  console.log(`[Stripe] Subscription activated for user ${userId} — tier: ${dbTier}`);
}

async function handleSubscriptionChange(stripeSub: Stripe.Subscription) {
  const db = await getDb();
  if (!db) return;

  const stripeSubId = stripeSub.id;
  const priceId = stripeSub.items.data[0]?.price.id ?? "";
  const planEntry2 = getPlanByPriceId(priceId);
  const dbTier2 = planEntry2 ? ARIA_PLANS[planEntry2].dbTier : "starter";
  const rawStatus = stripeSub.status;
  const status = rawStatus === "active" ? "active" : rawStatus === "canceled" ? "canceled" : "past_due";
  const p2Start = (stripeSub as unknown as { current_period_start?: number }).current_period_start;
  const p2End = (stripeSub as unknown as { current_period_end?: number }).current_period_end;

  await db.update(subscriptions).set({
    tier: dbTier2,
    status,
    currentPeriodStart: p2Start ? new Date(p2Start * 1000) : undefined,
    currentPeriodEnd: p2End ? new Date(p2End * 1000) : undefined,
    updatedAt: new Date(),
  }).where(eq(subscriptions.stripeSubscriptionId, stripeSubId));

  console.log(`[Stripe] Subscription ${stripeSubId} updated — status: ${status}, tier: ${dbTier2}`);
}
