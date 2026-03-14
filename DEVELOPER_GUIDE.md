# ARIA V3 Dashboard - Developer Guide

## Quick Start (5 minutes)

```bash
git clone https://github.com/disputestrike/ARIA-AI.git
cd ARIA-AI
pnpm install
cp .env.example .env.local
pnpm dev
```

Visit http://localhost:3000

## Architecture Overview

```
ARIA Dashboard (Client-Server App)
├── Frontend (React/Next.js)
│   ├── Pages: Brief → Checklist → Campaign Folder
│   ├── Modals: BrandKit, Scheduler, ClientShare
│   └── Integrations: DataForSEO, Epom DSP, AEO
├── Backend (tRPC + Drizzle)
│   ├── Routers: aria, campaigns, system
│   ├── Integrations: dataseo, epom, aeo
│   └── Database: projects, assets, versions, leads
└── Infrastructure
    ├── Database: MySQL (Drizzle ORM)
    ├── Cache: Redis (BullMQ)
    └── Storage: S3 (Cloudflare CDN)
```

## Project Structure

```
client/src/
├── pages/
│   ├── ARIA.tsx                 # Main dashboard (580 lines)
│   ├── Home.tsx                 # Landing page
│   └── FormPublic.tsx           # Public forms
├── components/
│   ├── BrandKitModal.tsx        # Brand settings
│   ├── SchedulerModal.tsx       # Post scheduler
│   └── ClientShareModal.tsx     # Client sharing
├── lib/
│   ├── error-handling.ts        # Error utilities
│   ├── observability.ts         # Monitoring
│   ├── trpc.ts                  # tRPC client
│   └── const.ts                 # Constants
└── contexts/
    └── ThemeContext.tsx         # Theme management

server/
├── routers.ts                   # All tRPC endpoints
├── tier-config.ts               # Pricing & limits
├── demo-campaign.ts             # Demo project
├── integrations/
│   ├── dataseo.ts              # SEO metrics
│   ├── epom.ts                 # Programmatic ads
│   └── aeo.ts                  # Answer engines
└── _core/
    ├── trpc.ts                 # tRPC setup
    └── llm-provider.ts         # Model config

drizzle/
└── schema.ts                   # Database tables
```

## Key Features

### Three-Step Builder
1. **Brief** - Enter what you want to build
   - Auto-detects entry point (New/Existing/Task/Clarify)
   - Web research on domain
   - Shows strategy summary

2. **Checklist** - Select assets to generate
   - Dynamic checklist from StrategyAgent JSON
   - Live token estimator
   - Tier enforcement

3. **Campaign Folder** - View & manage outputs
   - 8-control bar on each asset
   - Status indicators
   - Version control

### Brand Kit
- Logo, colors, fonts, tone, keywords
- Injected into all generation
- Persists across campaigns

### Integrations
- **DataForSEO** - Real SEO metrics (DA, traffic, keywords)
- **Epom DSP** - Programmatic advertising
- **AEO** - Answer Engine Optimization (ChatGPT, Perplexity, Google AI)

### Monetization
- Campaign limits per tier
- Usage tracking by month
- Overage pricing
- Stripe integration

## Environment Variables

### Required
```
DATASEO_LOGIN=your-email@example.com
DATASEO_PASSWORD=your-password
EPOM_API_KEY=epom-api-key
SERPAPI_KEY=serpapi-key
```

### Optional (Graceful fallback if missing)
```
PERPLEXITY_API_KEY=perplexity-key
PUBLIC_URL=http://localhost:3000
```

### For Testing
```
NODE_ENV=development
VITE_APP_ID=google-oauth-client-id
VITE_APP_SECRET=google-oauth-secret
```

## Running Tests

```bash
# Type checking
pnpm check

# Build
pnpm build

# Dev server with hot reload
pnpm dev

# Production build
pnpm build
pnpm start
```

## Database Setup

### Migrations (Drizzle)
```bash
# Apply migrations
pnpm db:migrate

# Seed demo data
pnpm db:seed

# Drop and recreate
pnpm db:drop
pnpm db:migrate
```

### Tables
- `users` - User accounts & tier
- `projects` - Campaigns
- `projectAssets` - Individual assets
- `campaignVersions` - Version snapshots
- `leads` - Landing page submissions
- `brandKits` - Brand settings
- `userMonthlyUsage` - Campaign tracking

## API Endpoints

### tRPC Routes
All endpoints under `/trpc/aria.*`

**Campaign Management**
- `aria.researchBrand` - Get strategy from input
- `aria.createProject` - Create campaign
- `aria.generateCampaign` - Queue DAG execution
- `aria.updateAsset` - Update asset content
- `aria.publishAsset` - Publish to platform

**Brand Kit**
- `aria.saveBrandKit` - Save brand settings
- `aria.getBrandKit` - Load brand settings

**Scheduling**
- `aria.scheduleAsset` - Schedule post

**Sharing**
- `aria.generateShareLink` - Create share token

**Integrations**
- `aria.getSEOAnalysis` - DataForSEO metrics
- `aria.createDSPCampaign` - Create Epom campaign
- `aria.launchDSPCampaign` - Launch with confirmation
- `aria.getDSPPerformance` - Real-time metrics
- `aria.auditAEOPresence` - AI search audit

**Limits**
- `aria.checkCampaignLimit` - Check tier limit
- `aria.incrementCampaignUsage` - Track usage

## Common Workflows

### Local Development
```bash
# 1. Start dev server
pnpm dev

# 2. Open http://localhost:3000

# 3. Sign in with Google OAuth (or test account)

# 4. Test three-step builder
# - Brief: "Launch my coffee subscription"
# - Checklist: Select assets
# - Folder: View campaign

# 5. Open DevTools → Console for observability logs
```

### Adding a New tRPC Procedure
```typescript
// server/routers.ts
export const ariaRouter = router({
  myNewProcedure: protectedProcedure
    .input(z.object({ /* validation */ }))
    .mutation(async ({ ctx, input }) => {
      // Implementation
      return result;
    }),
});

// client/src/pages/ARIA.tsx
const myMutation = trpc.aria.myNewProcedure.useMutation();
await myMutation.mutateAsync({ /* input */ });
```

### Adding a New Integration
```typescript
// server/integrations/myservice.ts
export async function myFunction(params: any) {
  // Call external API
  // Implement caching
  // Handle errors
  return result;
}

// server/routers.ts
const myProcedure: protectedProcedure
  .query(async ({ ctx, input }) => {
    const { myFunction } = await import("./integrations/myservice");
    return await myFunction(input);
  });
```

## Monitoring & Debugging

### Logs
- Browser DevTools → Console (frontend logs)
- Server terminal (backend logs)
- Sentry (error tracking in production)
- Datadog (metrics in production)

### Performance
- Lighthouse audit: `pnpm build && pnpm start`
- Network tab: Monitor API calls
- React DevTools: Inspect component renders
- Chrome DevTools: Memory profiling

### Error Handling
```typescript
import { handleError, showErrorToast } from "@/lib/error-handling";

try {
  await mutation.mutateAsync({ /* data */ });
} catch (error) {
  const errorResponse = handleError(error);
  showErrorToast(errorResponse);
}
```

## Deployment

### Railway
```bash
# 1. Connect GitHub repo
# 2. Set environment variables in Railway dashboard
# 3. Deploy: push to main branch
```

### Environment Variables (Production)
```
DATASEO_LOGIN=prod-email
DATASEO_PASSWORD=prod-password
EPOM_API_KEY=prod-key
SERPAPI_KEY=prod-key
PUBLIC_URL=https://aria.chat
NODE_ENV=production
```

### Pre-Launch Checklist
- [ ] All credentials rotated
- [ ] Environment variables set
- [ ] Database migrated
- [ ] npm run check passes (zero TS errors)
- [ ] Test three-step builder end-to-end
- [ ] Test brand kit persistence
- [ ] Test DSP campaign creation
- [ ] Test AEO audit
- [ ] Verify error handling
- [ ] Check Sentry integration
- [ ] Review demo campaign

## Troubleshooting

### OAuth Fails
- Check VITE_APP_ID matches Google OAuth config
- Verify SESSION_SECRET is set
- Check redirect URIs in Google Console

### Database Errors
- Run `pnpm db:migrate` to apply migrations
- Check DATABASE_URL is correct
- Verify MySQL is running

### API Integration Fails
- Check environment variables are set
- Verify API keys are valid
- Check rate limiting (add backoff retry)
- Look for Sentry errors in production

### Type Errors
- Run `pnpm check` to find issues
- Check Zod schemas match data types
- Verify tRPC input/output types

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes and test locally
3. Run `pnpm check` to verify types
4. Commit with descriptive message
5. Push and create pull request
6. Deploy to staging before production

## Resources

- [V3 Build Document](./BUILD_SUMMARY.md)
- [tRPC Docs](https://trpc.io)
- [Drizzle ORM Docs](https://orm.drizzle.team)
- [Next.js Docs](https://nextjs.org/docs)
- [DataForSEO API](https://docs.dataforseo.com)
- [Epom DSP API](https://epom.com/api)

## Support

- **Issues:** GitHub Issues
- **Questions:** Development team Slack
- **Bug Reports:** Sentry Dashboard
- **Performance:** Datadog Dashboard
