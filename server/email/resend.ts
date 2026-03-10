import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY ?? "");
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "ARIA <noreply@ariaai.app>";
const REPLY_TO = process.env.RESEND_REPLY_TO ?? "support@ariaai.app";

// ─── Base HTML Template ────────────────────────────────────────────────────────
function baseTemplate(content: string, preheader = "") {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ARIA</title>
  <style>
    body { margin: 0; padding: 0; background: #0a0a0f; font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; color: #e2e8f0; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .logo { font-size: 24px; font-weight: 700; color: #a855f7; letter-spacing: -0.5px; margin-bottom: 32px; }
    .logo span { color: #06b6d4; }
    .card { background: #12121a; border: 1px solid #1e1e2e; border-radius: 16px; padding: 32px; margin-bottom: 24px; }
    h1 { font-size: 28px; font-weight: 700; color: #f8fafc; margin: 0 0 16px; line-height: 1.3; }
    h2 { font-size: 20px; font-weight: 600; color: #f8fafc; margin: 0 0 12px; }
    p { font-size: 16px; line-height: 1.7; color: #94a3b8; margin: 0 0 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #a855f7, #06b6d4); color: #fff !important; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 16px; margin: 16px 0; }
    .highlight { color: #a855f7; font-weight: 600; }
    .cyan { color: #06b6d4; font-weight: 600; }
    .footer { text-align: center; color: #475569; font-size: 13px; margin-top: 32px; }
    .divider { border: none; border-top: 1px solid #1e1e2e; margin: 24px 0; }
    .stat-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin: 20px 0; }
    .stat { background: #0a0a0f; border: 1px solid #1e1e2e; border-radius: 10px; padding: 16px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #a855f7; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
    ul { color: #94a3b8; padding-left: 20px; }
    li { margin-bottom: 8px; line-height: 1.6; }
  </style>
</head>
<body>
  ${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ""}
  <div class="container">
    <div class="logo">ARIA<span>.</span></div>
    ${content}
    <div class="footer">
      <p>ARIA — Adaptive Response Intelligence Agent<br/>
      You're receiving this because you signed up for ARIA.<br/>
      <a href="{{unsubscribe_url}}" style="color:#475569;">Unsubscribe</a></p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Email 1: Welcome / Onboarding ────────────────────────────────────────────
export async function sendWelcomeEmail(to: string, name: string, loginUrl: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    replyTo: REPLY_TO,
    to,
    subject: `Welcome to ARIA — Your AI Marketing Brain is Ready 🧠`,
    html: baseTemplate(`
      <div class="card">
        <h1>Welcome, ${name}! 🎉</h1>
        <p>Your AI marketing brain is ready. ARIA is not just another tool — it's the last marketing platform you'll ever need.</p>
        <p>Here's what ARIA can do for you <span class="highlight">right now</span>:</p>
        <ul>
          <li>Build complete campaigns in <span class="cyan">under 3 minutes</span></li>
          <li>Write, schedule, and publish content across all platforms</li>
          <li>Analyze your competitors and find gaps in the market</li>
          <li>Run DSP ad campaigns with AI-optimized targeting</li>
          <li>Generate landing pages, emails, and creatives on demand</li>
        </ul>
        <p>Just type what you need. ARIA handles the rest.</p>
        <a href="${loginUrl}" class="btn">Start Talking to ARIA →</a>
      </div>
      <div class="card">
        <h2>Your First 3 Commands</h2>
        <p>Try these to get started:</p>
        <ul>
          <li><span class="highlight">"Build me a campaign for [your product]"</span></li>
          <li><span class="highlight">"Write 5 Instagram posts about my brand"</span></li>
          <li><span class="highlight">"Analyze my top 3 competitors"</span></li>
        </ul>
      </div>
    `, "Your AI marketing brain is ready — start building campaigns in minutes"),
  });
}

// ─── Email 2: Day 1 Activation ────────────────────────────────────────────────
export async function sendDay1ActivationEmail(to: string, name: string, loginUrl: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    replyTo: REPLY_TO,
    to,
    subject: `${name}, have you talked to ARIA yet?`,
    html: baseTemplate(`
      <div class="card">
        <h1>Your first campaign is waiting 🚀</h1>
        <p>Hey ${name}, you signed up yesterday but haven't run your first campaign yet.</p>
        <p>It takes <span class="highlight">less than 3 minutes</span> to go from zero to a fully built campaign with copy, creatives, and targeting.</p>
        <p>Just tell ARIA: <span class="cyan">"Build me a campaign for [your product or service]"</span></p>
        <a href="${loginUrl}" class="btn">Build My First Campaign →</a>
      </div>
    `, "Your first campaign takes less than 3 minutes to build"),
  });
}

// ─── Email 3: Day 3 Feature Discovery ────────────────────────────────────────
export async function sendDay3FeatureEmail(to: string, name: string, loginUrl: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    replyTo: REPLY_TO,
    to,
    subject: `Did you know ARIA can do this? (most users miss it)`,
    html: baseTemplate(`
      <div class="card">
        <h1>3 things most users miss 👀</h1>
        <p>Hey ${name}, here are 3 ARIA features that most users discover too late:</p>
        <ul>
          <li><span class="highlight">Competitor Intelligence</span> — Ask ARIA to analyze any competitor and get their strategy, weaknesses, and how to beat them</li>
          <li><span class="highlight">DSP Campaigns</span> — ARIA can launch programmatic ad campaigns across 50+ ad networks automatically</li>
          <li><span class="highlight">Memory</span> — ARIA remembers everything about your brand, so you never have to repeat yourself</li>
        </ul>
        <a href="${loginUrl}" class="btn">Explore ARIA's Features →</a>
      </div>
    `, "3 ARIA features most users discover too late"),
  });
}

// ─── Email 4: Day 7 Value Proof ───────────────────────────────────────────────
export async function sendWeek1ValueEmail(to: string, name: string, stats: { campaigns: number; contents: number; messages: number }, loginUrl: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    replyTo: REPLY_TO,
    to,
    subject: `Your first week with ARIA — here's what you built`,
    html: baseTemplate(`
      <div class="card">
        <h1>Look what you built this week 📊</h1>
        <p>Hey ${name}, here's your ARIA activity from the past 7 days:</p>
        <div class="stat-grid">
          <div class="stat">
            <div class="stat-value">${stats.campaigns}</div>
            <div class="stat-label">Campaigns Built</div>
          </div>
          <div class="stat">
            <div class="stat-value">${stats.contents}</div>
            <div class="stat-label">Content Pieces</div>
          </div>
          <div class="stat">
            <div class="stat-value">${stats.messages}</div>
            <div class="stat-label">AI Conversations</div>
          </div>
        </div>
        <p>You're just getting started. Teams using ARIA full-time report <span class="highlight">10x faster campaign launches</span> and <span class="cyan">40% lower CPAs</span>.</p>
        <a href="${loginUrl}" class="btn">Keep Building →</a>
      </div>
    `, `You built ${stats.campaigns} campaigns and ${stats.contents} content pieces this week`),
  });
}

// ─── Email 5: Upgrade Prompt ──────────────────────────────────────────────────
export async function sendUpgradePromptEmail(to: string, name: string, currentTier: string, upgradeUrl: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    replyTo: REPLY_TO,
    to,
    subject: `You're hitting your limits, ${name} — time to scale`,
    html: baseTemplate(`
      <div class="card">
        <h1>You're growing fast 📈</h1>
        <p>Hey ${name}, you're on the <span class="highlight">${currentTier}</span> plan and you're approaching your monthly limits.</p>
        <p>Upgrade to unlock:</p>
        <ul>
          <li>Unlimited AI conversations</li>
          <li>Unlimited campaigns and content</li>
          <li>DSP ad management with higher budgets</li>
          <li>Advanced analytics and reporting</li>
          <li>Priority support</li>
        </ul>
        <a href="${upgradeUrl}" class="btn">Upgrade My Plan →</a>
      </div>
    `, "You're approaching your plan limits — upgrade to keep growing"),
  });
}

// ─── Email 6: Payment Confirmation ────────────────────────────────────────────
export async function sendPaymentConfirmationEmail(to: string, name: string, plan: string, amount: number, loginUrl: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    replyTo: REPLY_TO,
    to,
    subject: `Payment confirmed — Welcome to ARIA ${plan} 🎉`,
    html: baseTemplate(`
      <div class="card">
        <h1>You're on ARIA ${plan}! 🚀</h1>
        <p>Hey ${name}, your payment of <span class="highlight">$${(amount / 100).toFixed(2)}</span> has been confirmed.</p>
        <p>Your <span class="cyan">${plan}</span> plan is now active. You have access to all features.</p>
        <a href="${loginUrl}" class="btn">Start Using ARIA ${plan} →</a>
      </div>
    `, `Your ARIA ${plan} subscription is now active`),
  });
}

// ─── Email 7: Campaign Completed ─────────────────────────────────────────────
export async function sendCampaignCompletedEmail(to: string, name: string, campaignName: string, loginUrl: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    replyTo: REPLY_TO,
    to,
    subject: `Your campaign "${campaignName}" is live 🎯`,
    html: baseTemplate(`
      <div class="card">
        <h1>Campaign launched! 🎯</h1>
        <p>Hey ${name}, your campaign <span class="highlight">"${campaignName}"</span> has been built and is ready to launch.</p>
        <p>ARIA has prepared your campaign strategy, ad copy, creatives, and targeting. Review it and hit publish.</p>
        <a href="${loginUrl}" class="btn">Review Campaign →</a>
      </div>
    `, `Your campaign "${campaignName}" is ready to launch`),
  });
}

// ─── Email 8: Weekly Report ───────────────────────────────────────────────────
export async function sendWeeklyReportEmail(to: string, name: string, reportUrl: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    replyTo: REPLY_TO,
    to,
    subject: `Your ARIA weekly marketing report is ready 📊`,
    html: baseTemplate(`
      <div class="card">
        <h1>Your weekly report is ready 📊</h1>
        <p>Hey ${name}, ARIA has analyzed your marketing performance for the past week.</p>
        <p>Your report includes:</p>
        <ul>
          <li>Campaign performance across all channels</li>
          <li>Content engagement metrics</li>
          <li>Competitor movement alerts</li>
          <li>AI-generated recommendations for next week</li>
        </ul>
        <a href="${reportUrl}" class="btn">View My Report →</a>
      </div>
    `, "Your weekly marketing performance report is ready"),
  });
}

// ─── Email 9: Content Published ──────────────────────────────────────────────
export async function sendContentPublishedEmail(to: string, name: string, contentTitle: string, platform: string, loginUrl: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    replyTo: REPLY_TO,
    to,
    subject: `Content published: "${contentTitle}" is live on ${platform}`,
    html: baseTemplate(`
      <div class="card">
        <h1>Content is live! ✅</h1>
        <p>Hey ${name}, your content <span class="highlight">"${contentTitle}"</span> has been published to <span class="cyan">${platform}</span>.</p>
        <a href="${loginUrl}" class="btn">View Performance →</a>
      </div>
    `, `"${contentTitle}" is now live on ${platform}`),
  });
}

// ─── Email 10: Trial Ending ───────────────────────────────────────────────────
export async function sendTrialEndingEmail(to: string, name: string, daysLeft: number, upgradeUrl: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    replyTo: REPLY_TO,
    to,
    subject: `${name}, your ARIA trial ends in ${daysLeft} days`,
    html: baseTemplate(`
      <div class="card">
        <h1>Your trial ends in ${daysLeft} days ⏰</h1>
        <p>Hey ${name}, your free trial of ARIA ends in <span class="highlight">${daysLeft} days</span>.</p>
        <p>Don't lose access to your campaigns, content, and brand memory. Upgrade now to keep everything.</p>
        <a href="${upgradeUrl}" class="btn">Upgrade Before Trial Ends →</a>
      </div>
    `, `Your ARIA trial ends in ${daysLeft} days — upgrade to keep access`),
  });
}

// ─── Email 11: Reactivation / Win-back ───────────────────────────────────────
export async function sendReactivationEmail(to: string, name: string, loginUrl: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    replyTo: REPLY_TO,
    to,
    subject: `${name}, ARIA has learned a lot since you left`,
    html: baseTemplate(`
      <div class="card">
        <h1>We've been busy 🧠</h1>
        <p>Hey ${name}, a lot has changed since you last used ARIA.</p>
        <p>New capabilities added:</p>
        <ul>
          <li>Video ad generation with HeyGen integration</li>
          <li>Real-time competitor intelligence</li>
          <li>Automated email sequences with 12-step nurture flows</li>
          <li>DSP campaigns across 50+ ad networks</li>
        </ul>
        <p>Come back and see what ARIA can do for your business today.</p>
        <a href="${loginUrl}" class="btn">Come Back to ARIA →</a>
      </div>
    `, "ARIA has new features — come back and see what's changed"),
  });
}

// ─── Email 12: Cancellation / Offboarding ────────────────────────────────────
export async function sendCancellationEmail(to: string, name: string, reactivateUrl: string) {
  return resend.emails.send({
    from: FROM_EMAIL,
    replyTo: REPLY_TO,
    to,
    subject: `Your ARIA subscription has been canceled`,
    html: baseTemplate(`
      <div class="card">
        <h1>We're sorry to see you go 😢</h1>
        <p>Hey ${name}, your ARIA subscription has been canceled. Your data will be kept for 30 days.</p>
        <p>If you change your mind, you can reactivate anytime and pick up right where you left off — all your campaigns, content, and brand memory will still be there.</p>
        <a href="${reactivateUrl}" class="btn">Reactivate My Account →</a>
      </div>
    `, "Your ARIA subscription has been canceled — reactivate anytime"),
  });
}
