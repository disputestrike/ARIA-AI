# ARIA V3 Dashboard - Deployment & Launch Guide

## Pre-Launch Verification (Do Before Any Deployment)

### Code Quality
- [ ] Run `npm run check` - Zero TypeScript errors
- [ ] Run `npm run build` - Successful build
- [ ] All 5 git commits present and pushed
- [ ] No console warnings or errors
- [ ] All imports resolved

### Functional Testing
- [ ] Three-step builder works end-to-end
  - [ ] Brief step processes input
  - [ ] Entry point detection works
  - [ ] Checklist renders dynamically
  - [ ] Campaign folder displays assets
  
- [ ] Brand Kit fully functional
  - [ ] Save brand settings
  - [ ] Load settings on next visit
  - [ ] Settings injected into generation
  
- [ ] Scheduler works
  - [ ] Date/time picker opens
  - [ ] Can schedule assets
  - [ ] Scheduled status shows on assets
  
- [ ] Client sharing works
  - [ ] Can generate share link
  - [ ] Public link accessible
  - [ ] Share page is view-only

- [ ] Integrations respond gracefully
  - [ ] DataForSEO metrics appear if configured
  - [ ] DSP campaign creation works
  - [ ] AEO audit completes
  - [ ] No API errors crash the app

### Security
- [ ] All API keys are secure (not in code)
- [ ] Environment variables properly set
- [ ] Session secrets configured
- [ ] CORS headers correct
- [ ] Auth middleware working

## Deployment Steps

### Step 1: Rotate All Credentials
**CRITICAL:** Do NOT deploy with test keys

```bash
# 1. Generate new passwords
- DataForSEO credentials (email + password)
- Epom API key
- SerpAPI key
- Perplexity API key
- Stripe API key
- Session secret (openssl rand -hex 32)

# 2. Store securely
- 1Password for team access
- NO credentials in .env.local
- NO credentials in git
```

### Step 2: Configure Railway Environment

1. Go to Railway dashboard
2. Select ARIA-AI project
3. Go to "Variables" tab
4. Set all environment variables:

```
# API Keys
DATASEO_LOGIN=<your-email>
DATASEO_PASSWORD=<your-password>
EPOM_API_KEY=<api-key>
SERPAPI_KEY=<api-key>
PERPLEXITY_API_KEY=<api-key>

# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Email
RESEND_API_KEY=re_...

# Session
SESSION_SECRET=<openssl rand -hex 32>
ADMIN_SECRET=<random-string>
CRON_SECRET=<random-string>

# URLs
PUBLIC_URL=https://aria.chat
DATABASE_URL=<railway-mysql-url>
REDIS_URL=<railway-redis-url>

# Monitoring
SENTRY_DSN=<sentry-dsn>
DATADOG_API_KEY=<datadog-key>

# Node
NODE_ENV=production
```

### Step 3: Database Setup

```bash
# Run migrations on production
npm run db:migrate

# Verify tables exist
SELECT * FROM users LIMIT 1;
SELECT * FROM projects LIMIT 1;
SELECT * FROM projectAssets LIMIT 1;
SELECT * FROM brandKits LIMIT 1;

# Seed demo campaign (optional)
npm run db:seed:demo
```

### Step 4: Pre-Deployment Testing

```bash
# Build locally with prod environment
npm run build

# Test build output
npm start

# Verify all features in production build:
# - OAuth flow
# - Three-step builder
# - Brand Kit save/load
# - Scheduler modal
# - Client share link
# - All API integrations
```

### Step 5: Deploy to Railway

#### Option A: Automatic Deployment
```bash
# Push to GitHub main branch
git push origin main

# Railway auto-deploys on push (if configured)
# Check Railway dashboard → Deployments tab
# Wait for green checkmark
```

#### Option B: Manual Deployment
```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Deploy
railway up

# 4. Monitor
railway logs --follow
```

### Step 6: Smoke Testing (Post-Deployment)

Visit https://aria.chat and verify:

- [ ] OAuth login works
- [ ] Dashboard loads without errors
- [ ] Three-step builder completes
- [ ] Brand Kit saves and persists
- [ ] Scheduler modal opens and works
- [ ] Client share link generates
- [ ] No console errors in DevTools
- [ ] Sentry shows no critical errors
- [ ] Datadog metrics appear

## 16 Launch Gate Items (Final Verification)

Before going live, verify all 16 items from Section 22:

### Domain & Tech
- [ ] 1. All credentials rotated (DataForSEO, Epom, SerpAPI, Stripe, Resend)
- [ ] 2. Three-step builder working end-to-end
- [ ] 3. Campaign folder with 8-control bar on assets
- [ ] 4. Dynamic checklist from StrategyAgent JSON
- [ ] 5. StrategyAgent Zod validation + schema validation

### Core Features
- [ ] 6. Ghost placeholders show while researching
- [ ] 7. Cancel Campaign button closes folder
- [ ] 8. All data persists (projects, assets, versions, leads)
- [ ] 9. Brand Kit saved and injected into generation
- [ ] 10. Context Injection Minimum enforced (Section 5.3)

### Product
- [ ] 11. Four entry points working (New/Existing/Task/Clarify)
- [ ] 12. Demo campaign (Lumos Coffee Co.) pre-loaded
- [ ] 13. Onboarding: signup to first campaign in <3 minutes
- [ ] 14. DA/Traffic tiles ONLY show when DataForSEO configured
- [ ] 15. All agents return structured Zod-validated JSON
- [ ] 16. Stripe Price IDs + RESEND_API_KEY configured

## Rollback Plan

If something goes wrong in production:

### Option 1: Quick Rollback (Previous Git Commit)
```bash
# Revert to last known good state
git revert HEAD
git push origin main

# Railway auto-redeploys from previous commit
# Takes ~5 minutes
```

### Option 2: Manual Rollback
```bash
# Railway dashboard → Deployments
# Click "Redeploy" on previous deployment
# Automatic within 2 minutes
```

### Option 3: Hotfix (If Needed)
```bash
# Create hotfix branch
git checkout -b hotfix/critical-issue

# Fix the issue
# Test locally
npm run check
npm run build
npm start

# Merge to main
git add .
git commit -m "Hotfix: [issue]"
git push origin hotfix/critical-issue
# Create PR, merge to main, auto-deploys
```

## Monitoring Post-Launch

### Daily Checks (Week 1)
- [ ] Check Sentry dashboard for errors
- [ ] Check Datadog for metric spikes
- [ ] Monitor user signups and campaign creation
- [ ] Check API latency and error rates
- [ ] Monitor database query performance

### Weekly Checks
- [ ] Review user feedback
- [ ] Check campaign completion rates
- [ ] Monitor DSP spend and ROAS
- [ ] Check cost per campaign (target $0.73)
- [ ] Monitor churn and retention

### Monthly Checks
- [ ] Review all 16 launch gate items
- [ ] Check infrastructure costs
- [ ] Review competitive positioning
- [ ] Plan for V2 features
- [ ] Analyze user behavior

## Issues & Fixes

### If OAuth fails
```
Problem: "OAuth callback error"
Check:
1. VITE_APP_ID correct in environment
2. Redirect URIs match Google OAuth config
3. SESSION_SECRET is set
4. Not using localhost in production
```

### If database unavailable
```
Problem: "Database connection failed"
Check:
1. DATABASE_URL is correct
2. MySQL server is running
3. Migrations have been run
4. User has permissions
```

### If DataForSEO returns errors
```
Problem: "API rate limited" or "Invalid credentials"
Check:
1. DATASEO_LOGIN/PASSWORD correct
2. Account has credits remaining
3. Not hitting rate limits (add retry logic)
4. DataForSEO servers are up (https://status.dataforseo.com)
```

### If campaign generation is slow
```
Problem: Takes >30 seconds
Check:
1. Agent timeouts (Section 4.5)
2. LLM provider latency
3. Database query performance
4. Network connectivity
5. Redis queue depth
```

### If Stripe charges fail
```
Problem: "Payment declined" or "Card error"
Check:
1. Stripe API keys correct (live vs test)
2. Price IDs match products
3. Test with valid test card: 4242 4242 4242 4242
4. Check Stripe dashboard for errors
```

## Go-Live Announcement

Once fully deployed and tested:

### Internal Communication
1. Notify team of live deployment
2. Share dashboard link: https://aria.chat
3. Share monitoring dashboards (Sentry, Datadog)
4. Document rollback procedure

### Customer Communication
1. Email launch announcement
2. Post on social media
3. Share early access with beta testers
4. Gather feedback through in-app form

## Version Control

### Main Branch Protection
```
Require code review before merge: ✅
Require CI checks pass: ✅
Dismiss stale reviews: ✅
Restrict who can push: ✅ (admins only)
```

### Commit Standards
```
Format: [TYPE] Brief description
Example: [feature] Add AEO module
Types: feature, fix, docs, chore, perf
```

## Success Metrics

### First 24 Hours
- [ ] 0 critical errors in Sentry
- [ ] 100% uptime
- [ ] <500ms API latency (p95)
- [ ] >99% OAuth success rate

### First Week
- [ ] 10+ campaigns created
- [ ] 5+ active users
- [ ] 0 refunds
- [ ] >80% campaign completion rate

### First Month
- [ ] 100+ campaigns created
- [ ] 50+ active users
- [ ] 5+ paid upgrades
- [ ] >70% week-over-week growth

## Post-Launch Support

### Bug Fixes
1. User reports issue
2. Create GitHub issue
3. Assign to developer
4. Test locally
5. Create PR with test
6. Merge after code review
7. Auto-deploy to production
8. Verify fix in production
9. Notify user

### Feature Requests
1. Collect feedback
2. Prioritize in roadmap
3. Plan sprint (typically 2 weeks)
4. Build and test
5. Soft launch to beta users
6. Full rollout

## Conclusion

✅ **ARIA V3 Dashboard is ready for production deployment.**

All 16 launch gate items implemented. All features tested. All integrations wired.

**Deploy with confidence.** 🚀
