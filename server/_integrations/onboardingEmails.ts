interface EmailTemplate {
  id: string;
  day: number;
  subject: string;
  preview: string;
  title: string;
  body: string;
}

export const ONBOARDING_SEQUENCE: EmailTemplate[] = [
  {
    id: "welcome",
    day: 0,
    subject: "Welcome to ARIA 🚀 Your AI Marketing OS is ready",
    preview: "Start building campaigns in 3 minutes",
    title: "You're In! Here's How to Get Started",
    body: `Hello!

Welcome to ARIA — your AI marketing operating system that replaces every tool you currently pay for.

Here's what you can do right now:

1. **Tell ARIA what you want to build**
   Just describe it in plain English. A full campaign, a landing page, an email sequence — anything.

2. **ARIA detects what you need**
   Full campaign builder? Quick single asset? Existing brand optimization? ARIA routes you automatically.

3. **Get production-ready assets in 90 seconds**
   No templates. No menus. No setup. Just work.

👉 **[Start Your First Campaign]**

Your Free Plan includes:
✓ 1 full campaign per month
✓ All content types (emails, social, landing pages)
✓ 7-day early access to features
✓ Unblock later: upgrade anytime

Questions? Reply to this email or jump into our community Slack.

Let's go,
The ARIA Team`,
  },

  {
    id: "feature_day_1",
    day: 1,
    subject: "The 3-Step Campaign Builder You Need to See",
    preview: "Full campaigns built in 90 seconds",
    title: "Your Campaign Builder is Live",
    body: `Hi there!

Today we want to show you the *real* power of ARIA.

The campaign builder works in 3 steps:

**Step 1: Brief**
Tell ARIA about your product/service. It searches the web, analyzes your industry, and builds a strategy automatically.

**Step 2: Checklist**
You see a dynamic asset checklist (different every time based on your industry). Pick what you want:
- Blog posts
- Email sequences  
- Social calendars
- Video scripts
- Landing pages
- Ads
- SEO audits
- And 15+ more

**Step 3: Folder**
All assets appear in your campaign folder. Edit, download, publish, schedule, share — everything you need.

No questions. No onboarding. No setup.

👉 **[Watch 2-Minute Demo]**

This is what Mega AI charges $299/month for (with humans).
ARIA does it fully automated at $49/month.

Try it,
ARIA`,
  },

  {
    id: "feature_day_2",
    day: 2,
    subject: "Brand Kit: Never Brief ARIA Again",
    preview: "Set your brand once, use everywhere",
    title: "Set Up Your Brand Kit (2 minutes)",
    body: `Hey!

One of our most powerful features is the Brand Kit.

Here's why it matters:

Every time you generate content, ARIA injects your brand automatically:
✓ Your tone of voice
✓ Your brand colors
✓ Your target audience
✓ Your key competitors
✓ Your keywords

You set it once. Every asset that ARIA creates from then on matches your brand perfectly.

No copy/paste. No "but does it sound like us?" No manual brand proofing.

👉 **[Create Your Brand Kit Now]** (takes 2 minutes)

Once you set this, every single asset — emails, ads, blog posts, videos — comes out in your voice automatically.

Talk soon,
ARIA`,
  },

  {
    id: "feature_day_3",
    day: 3,
    subject: "The $0 Cost Secret (Seriously)",
    preview: "See how ARIA costs less than Jasper",
    title: "Your Real Cost per Campaign",
    body: `Quick numbers:

**Jasper**: $69/month = just a copywriter
**HubSpot**: $800/month = a team of tools
**Mega AI**: $299/month + humans = expensive

**ARIA**: $49/month
- Full campaign builder
- Video studio
- SEO audits
- Email sequences
- Social scheduling
- Competitor analysis
- All automated

Here's the kicker:

Each campaign costs us $0.73 to generate (our costs).
Each campaign *you* use frees up $5-50 in tools you can cancel.

So if you generate just 1 campaign/month on Starter, you're already profitable.

Most users run 5+ campaigns/month.

👉 **[See Pricing Plans]**

Do the math. It's hard to be anything but ARIA.

ARIA`,
  },

  {
    id: "feature_day_4",
    day: 4,
    subject: "3 Things Your Competitors Are Doing (You're Not)",
    preview: "Competitor intelligence report",
    title: "Know What Your Competitors Are Doing",
    body: `One feature separates ARIA from every other tool:

**Competitor Intelligence**

Run it on any competitor website and ARIA shows:
✓ Their traffic (monthly estimate)
✓ Their top keywords they rank for
✓ Their content strategy
✓ Their ad spend estimate
✓ Their social strategy
✓ Their tech stack

Example: We ran it on a Jasper competitor.
- $2.1M/month organic traffic
- Ranking for 3,200+ keywords
- Spending $45K/month on ads
- 8 blog posts per month

Now you can see the gaps and build exactly what they're missing.

👉 **[Try Competitor Intel]**

This costs $300+/month in other tools.
ARIA includes it free on all plans.

ARIA`,
  },

  {
    id: "feature_day_5",
    day: 5,
    subject: "Upgrade & Unlock Video, Video, Video",
    preview: "Full AI video production from scripts",
    title: "The Video Studio Changes Everything",
    body: `Here's what Free gets you:
✓ Content generation (all types)
✓ Email + social
✓ Basic SEO
✓ Strategy + competitor intel

Here's what Starter unlocks ($49/month):
✓ Everything above
✓ **Video Studio** ← This is the power move
✓ Real video scripts (platform-native: TikTok, Reels, YouTube)
✓ AI voiceover integration
✓ Avatar selection
✓ Music generation
✓ Auto thumbnails
✓ Script → rendered video in minutes

Video is 40% of all content now.
ARIA generates the full pipeline.

👉 **[See Video Studio]** (Pro required)

Then there's Pro ($98/month):
✓ Everything above
✓ HeyGen video rendering (your brand, your avatar)
✓ Advanced analytics
✓ DSP ads (programmatic)
✓ Opponent ad spy

Most users see ROI in the first 3 campaigns.

Talk soon,
ARIA`,
  },

  {
    id: "feature_day_6",
    day: 6,
    subject: "Last Thing Before You Go (The Refund Policy)",
    preview: "30-day money-back guarantee",
    title: "We're So Confident: Full 30-Day Refund",
    body: `You have 30 days.

Try Starter ($49/month). Generate a few campaigns.
If ARIA didn't save you hours and actually work?
Full refund. No questions.

We don't want your money if we didn't earn it.

Here's what usually happens:

**Week 1**: "Wow, that actually worked."
**Week 2**: "Wait, this replaced my $800 HubSpot?"
**Week 3**: "I'm canceling Jasper, AdCreative, and Hootsuite."
**Month 2**: "Why wasn't I using this earlier?"

Most users upgrade to Pro within 60 days.

👉 **[Start 30-Day Trial]**

We're betting you'll love this.

ARIA`,
  },

  {
    id: "feature_day_7",
    day: 7,
    subject: "Your First Campaign Awaits (And One Bonus)",
    preview: "Bonus: The Referral Program",
    title: "The ARIA Referral Program Is Live",
    body: `One last thing:

**You have a referral link now.**

Share it with a friend who needs marketing help.
When they sign up and upgrade to paid?
You get 1 free campaign per referral.

So if 5 friends join, that's 5 free campaigns.
That's $245 in free credits.

We're doing this because:
1. You're the best marketing for ARIA (real users, real results)
2. Your network needs this too
3. We want to reward early believers

👉 **[Get Your Referral Link]**

Here's your link:
https://aria.ai/ref/YOUR_CODE

Drop it in your personal network. Slack. Twitter. LinkedIn. Whatever.

You've got this.

ARIA

---
P.S. — Still have questions? Hit reply. We read every single message.`,
  },
];

export async function sendOnboardingEmail(
  userId: string,
  userEmail: string,
  dayOffset: number = 0
): Promise<{ success: boolean; emailId?: string; error?: string }> {
  try {
    const template = ONBOARDING_SEQUENCE[Math.min(dayOffset, ONBOARDING_SEQUENCE.length - 1)];

    if (!template) {
      return {
        success: false,
        error: "Email template not found",
      };
    }

    // In production: use Resend or email service
    const resendToken = process.env.RESEND_API_KEY;
    if (!resendToken) {
      console.log(`[STUB] Would send email to ${userEmail}: ${template.subject}`);
      return {
        success: true,
        emailId: `email_${Date.now()}`,
      };
    }

    // Send via Resend
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "ARIA <onboarding@aria.ai>",
        to: userEmail,
        subject: template.subject,
        html: `
          <html>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #1a1a1a; max-width: 600px; margin: 0 auto;">
              <div style="padding: 40px 20px;">
                <h2>${template.title}</h2>
                <div style="white-space: pre-wrap;">${template.body}</div>
                <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; font-size: 12px; color: #666;">
                  <p>© 2026 ARIA. All rights reserved.</p>
                </div>
              </div>
            </body>
          </html>
        `,
      }),
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Email service error: ${response.statusText}`,
      };
    }

    const data = (await response.json()) as { id: string };

    return {
      success: true,
      emailId: data.id,
    };
  } catch (error) {
    console.error("Onboarding email error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function scheduleOnboardingSequence(
  userId: string,
  userEmail: string
): Promise<void> {
  // In production: use a job queue (Bull, Temporal, etc)
  for (let day = 0; day < ONBOARDING_SEQUENCE.length; day++) {
    const delayMs = day * 24 * 60 * 60 * 1000; // 1 day per email

    setTimeout(() => {
      sendOnboardingEmail(userId, userEmail, day).catch(err =>
        console.error(`Failed to send day ${day} email:`, err)
      );
    }, delayMs);
  }
}
