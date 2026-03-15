import Stripe from "stripe";
import { z } from "zod";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10",
});

// Tier to price ID mapping
const TIER_PRICE_IDS = {
  starter: process.env.STRIPE_PRICE_STARTER || "price_starter",
  pro: process.env.STRIPE_PRICE_PRO || "price_pro",
  business: process.env.STRIPE_PRICE_BUSINESS || "price_business",
  agency: process.env.STRIPE_PRICE_AGENCY || "price_agency",
  enterprise: process.env.STRIPE_PRICE_ENTERPRISE || "price_enterprise",
};

const OVERAGE_PRICE_ID = process.env.STRIPE_PRICE_OVERAGE || "price_overage";

export async function createStripeCheckoutSession(input: {
  userId: number;
  userEmail: string;
  tier: "starter" | "pro" | "business" | "agency" | "enterprise";
  billingCycle: "monthly" | "annual";
}): Promise<{ sessionId: string; url: string }> {
  try {
    const priceId = TIER_PRICE_IDS[input.tier];

    const session = await stripe.checkout.sessions.create({
      customer_email: input.userEmail,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.ORIGIN}/settings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.ORIGIN}/pricing`,
      metadata: {
        userId: input.userId.toString(),
        tier: input.tier,
      },
    });

    return {
      sessionId: session.id,
      url: session.url || "",
    };
  } catch (error) {
    console.error("Stripe checkout error:", error);
    throw new Error("Failed to create checkout session");
  }
}

export async function createPayPerCampaignCheckout(input: {
  userId: number;
  userEmail: string;
  campaignName: string;
}): Promise<{ sessionId: string; url: string }> {
  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: input.userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Single Campaign",
              description: `Generate: ${input.campaignName}`,
            },
            unit_amount: 4900, // $49.00
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.ORIGIN}/campaigns?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.ORIGIN}/`,
      metadata: {
        userId: input.userId.toString(),
        type: "pay_per_campaign",
        campaignName: input.campaignName,
      },
    });

    return {
      sessionId: session.id,
      url: session.url || "",
    };
  } catch (error) {
    console.error("Pay per campaign checkout error:", error);
    throw new Error("Failed to create payment session");
  }
}

export async function createOverageCheckout(input: {
  userId: number;
  userEmail: string;
  campaignsNeeded: number;
  tier: string;
}): Promise<{ sessionId: string; url: string }> {
  // Calculate overage price based on tier
  const overagePrices: Record<string, number> = {
    starter: 800, // $8.00
    pro: 500, // $5.00
    business: 300, // $3.00
    agency: 150, // $1.50
    enterprise: 0,
  };

  const pricePerCampaign = overagePrices[input.tier] || 500;
  const totalAmount = pricePerCampaign * input.campaignsNeeded;

  try {
    const session = await stripe.checkout.sessions.create({
      customer_email: input.userEmail,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Campaign Overage",
              description: `${input.campaignsNeeded} additional campaigns`,
            },
            unit_amount: totalAmount,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.ORIGIN}/campaigns`,
      cancel_url: `${process.env.ORIGIN}/settings`,
      metadata: {
        userId: input.userId.toString(),
        type: "overage",
        tier: input.tier,
        campaigns: input.campaignsNeeded.toString(),
      },
    });

    return {
      sessionId: session.id,
      url: session.url || "",
    };
  } catch (error) {
    console.error("Overage checkout error:", error);
    throw new Error("Failed to create overage checkout");
  }
}

export async function cancelSubscription(customerId: string): Promise<void> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length > 0) {
      await stripe.subscriptions.cancel(subscriptions.data[0].id);
    }
  } catch (error) {
    console.error("Cancel subscription error:", error);
    throw new Error("Failed to cancel subscription");
  }
}

export async function getSubscriptionStatus(customerId: string): Promise<{
  status: string;
  tier: string;
  currentPeriodEnd: number;
  cancelAtPeriodEnd: boolean;
}> {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      return {
        status: "none",
        tier: "free",
        currentPeriodEnd: 0,
        cancelAtPeriodEnd: false,
      };
    }

    const subscription = subscriptions.data[0];
    const tier = subscription.metadata?.tier || "starter";

    return {
      status: subscription.status,
      tier,
      currentPeriodEnd: subscription.current_period_end * 1000,
      cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
    };
  } catch (error) {
    console.error("Get subscription error:", error);
    return {
      status: "unknown",
      tier: "free",
      currentPeriodEnd: 0,
      cancelAtPeriodEnd: false,
    };
  }
}

// Webhook handler for Stripe events
export async function handleStripeWebhook(
  body: string,
  signature: string
): Promise<Stripe.Event | null> {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );

    switch (event.type) {
      case "checkout.session.completed":
        // Handle successful payment
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Payment completed:", session.metadata);
        // Update user subscription tier in DB
        break;

      case "invoice.payment_succeeded":
        // Handle recurring payment
        const invoice = event.data.object as Stripe.Invoice;
        console.log("Invoice paid:", invoice.id);
        break;

      case "invoice.payment_failed":
        // Handle failed payment
        const failedInvoice = event.data.object as Stripe.Invoice;
        console.log("Invoice failed:", failedInvoice.id);
        // Send notification to user
        break;

      case "customer.subscription.deleted":
        // Handle subscription cancellation
        const deletedSubscription = event.data.object as Stripe.Subscription;
        console.log("Subscription cancelled:", deletedSubscription.id);
        // Downgrade user to free tier
        break;
    }

    return event;
  } catch (error) {
    console.error("Webhook error:", error);
    return null;
  }
}
