# Pulse - Whop Community Analytics MVP

## Project Overview
Pulse is a Whop app that helps community creators monitor member engagement. This is the MVP version - a Member Activity Monitor showing which members are active vs. inactive.

## Critical Constraints
**We're building an MVP TODAY** - keep it simple and ship fast.

---

## Tech Stack & Versions
- **Next.js**: 14+ with App Router
- **Whop SDK**: @whop/api (v0.0.46+), @whop/react (v0.2.28+), @whop-apps/sdk (v0.0.1-canary.117+)
- **Design System**: @whop/frosted-ui (use this for ALL UI components)
- **Database**: Supabase with connection pooling
- **Runtime**: Node.js 18.x or 20.x
- **Package Manager**: pnpm

---

## Non-Negotiable Rules

### 1. Force Dynamic Rendering
```typescript
// MUST be on EVERY page that fetches data
export const dynamic = "force-dynamic";
```
**Why**: Without this, Next.js caches pages and breaks authentication + real-time data.

### 2. No Browser Storage
```typescript
// ❌ NEVER DO THIS - Will break in Whop iframe
localStorage.setItem('data', value);
sessionStorage.setItem('data', value);

// ✅ DO THIS INSTEAD
const [data, setData] = useState(initialValue); // React state
```
**Why**: Browser storage APIs don't work in Whop's iframe environment.

### 3. Company-Scoped Queries
```typescript
// ❌ NEVER DO THIS - Data leakage!
const { data } = await supabase.from('members').select('*');

// ✅ ALWAYS DO THIS
const { data } = await supabase
  .from('members')
  .select('*')
  .eq('company_id', companyId);
```
**Why**: Multi-tenant data isolation is critical. Missing this causes data leaks.

### 4. SDK Singleton Pattern
```typescript
// ❌ DON'T create SDK per request
function handler() {
  const sdk = WhopServerSdk({ ... }); // BAD
}

// ✅ Create once, reuse everywhere
// lib/whop-sdk.ts
export const whopSdk = WhopServerSdk({ ... });
```
**Why**: Creating SDK instances per request causes connection exhaustion.

### 5. Use Frosted UI Components
```typescript
// ❌ DON'T create custom buttons/cards
<button className="...">Click me</button>

// ✅ USE Frosted UI
import { Button, Card } from '@whop/frosted-ui';
<Button>Click me</Button>
```
**Why**: Consistency with Whop's design system + less code to maintain.

---

## Project Structure

```
pulse-whop-app/
├── app/
│   ├── layout.tsx                    # Root layout with WhopApp provider
│   ├── experiences/
│   │   └── [experienceId]/
│   │       ├── page.tsx              # Main dashboard (SERVER component)
│   │       └── client-ui.tsx         # Interactive UI (CLIENT component)
│   └── api/
│       └── members/
│           └── route.ts              # API endpoints if needed
├── lib/
│   ├── whop-sdk.ts                   # Server SDK singleton
│   ├── supabase.ts                   # Supabase client singleton
│   └── types.ts                      # TypeScript types
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql    # Database schema
├── .env.local                        # Environment variables (NEVER commit!)
├── .env.example                      # Template for env vars
├── next.config.ts                    # Next.js config with withWhopAppConfig
└── package.json
```

---

## Environment Variables

**Server-only (NO NEXT_PUBLIC_ prefix):**
```bash
WHOP_API_KEY=               # From Whop dashboard
WHOP_CLIENT_SECRET=         # From Whop dashboard
NEXTAUTH_SECRET=            # Generate with: openssl rand -base64 32
SUPABASE_ANON_KEY=          # From Supabase dashboard
```

**Client-accessible (NEXT_PUBLIC_ prefix):**
```bash
NEXT_PUBLIC_WHOP_APP_ID=            # Format: app_XXXXXXXX
NEXT_PUBLIC_WHOP_COMPANY_ID=        # Format: biz_XXXXXXXX
NEXT_PUBLIC_WHOP_CLIENT_ID=         # From Whop dashboard
NEXTAUTH_URL=                       # http://localhost:3000 (dev) or https://your-app.vercel.app (prod)
NEXT_PUBLIC_SUPABASE_URL=           # From Supabase (must have 'pooler' in URL)
```

---

## MVP Feature Scope

### What We're Building:
1. **Member List Table**
   - Show all members in the community
   - Display: Avatar, Name, Email, Engagement Score, Status, Last Active

2. **Engagement Score Calculation**
   - Simple algorithm based on `last_active_at`
   - 0-7 days ago → Active (score 80-100, green badge)
   - 8-30 days ago → At Risk (score 40-79, yellow badge)
   - 30+ days ago → Inactive (score 0-39, red badge)

3. **Stats Summary**
   - Total members
   - Active count
   - At Risk count
   - Inactive count

4. **Basic Interactivity**
   - Filter by status (All/Active/At Risk/Inactive)
   - Sort by score/name/last active
   - Search by member name

### What We're NOT Building (Yet):
- ❌ AI/ML churn prediction
- ❌ Content performance analytics
- ❌ Revenue optimization
- ❌ Webhooks (use polling for MVP)
- ❌ Historical data/charts
- ❌ Automated alerts
- ❌ Export functionality

---

## Code Patterns

### Server Component (Data Fetching)
```typescript
// app/experiences/[experienceId]/page.tsx
import { validateToken } from "@whop-apps/sdk";
import { headers } from "next/headers";
import { whopSdk } from "@/lib/whop-sdk";

export const dynamic = "force-dynamic"; // CRITICAL!

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: { experienceId: string };
  searchParams: { companyId?: string };
}) {
  const headersList = await headers();
  const { userId } = await validateToken({ headers: headersList });
  
  if (!userId) {
    return <div>Authentication required</div>;
  }
  
  const companyId = searchParams.companyId;
  
  // Validate user access
  const access = await whopSdk.access.checkIfUserHasAccessToCompany({
    userId,
    companyId: companyId!,
  });
  
  if (!access.hasAccess) {
    return <div>Access denied</div>;
  }
  
  // Fetch data
  const members = await fetchMembers(companyId);
  
  return <ClientUI members={members} />;
}
```

### Client Component (Interactivity)
```typescript
// app/experiences/[experienceId]/client-ui.tsx
"use client"; // MUST be first line!

import { useState } from "react";
import { Button, Card, Badge, Table } from "@whop/frosted-ui";

interface Member {
  id: string;
  name: string;
  email: string;
  score: number;
  status: 'active' | 'at_risk' | 'inactive';
}

export function ClientUI({ members }: { members: Member[] }) {
  const [filter, setFilter] = useState<'all' | 'active' | 'at_risk' | 'inactive'>('all');
  
  const filtered = members.filter(m => 
    filter === 'all' ? true : m.status === filter
  );
  
  return (
    <Card>
      <Button onClick={() => setFilter('all')}>All</Button>
      <Button onClick={() => setFilter('active')}>Active</Button>
      {/* ... render table ... */}
    </Card>
  );
}
```

### SDK Singleton
```typescript
// lib/whop-sdk.ts
import { WhopServerSdk } from "@whop/api";

export const whopSdk = WhopServerSdk({
  appId: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
  appApiKey: process.env.WHOP_API_KEY!,
  companyId: process.env.NEXT_PUBLIC_WHOP_COMPANY_ID,
});
```

### Supabase Client
```typescript
// lib/supabase.ts
import { createClient } from "@supabase/supabase-js";

// Connection pooling is handled automatically by Supabase for REST API
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, // https://*.supabase.co
  process.env.SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  }
);

// CRITICAL: ALWAYS add .limit() to queries to prevent excessive data transfer!
const { data } = await supabase
  .from('member_activity')
  .select('*')
  .eq('company_id', companyId)
  .limit(1000); // Prevent fetching unlimited rows - THIS IS MANDATORY
```

---

## Database Schema

```sql
-- member_activity table
CREATE TABLE member_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  email TEXT,
  username TEXT,
  last_active_at TIMESTAMPTZ,
  engagement_score INTEGER CHECK (engagement_score >= 0 AND engagement_score <= 100),
  status TEXT CHECK (status IN ('active', 'at_risk', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(company_id, user_id)
);

-- Indexes
CREATE INDEX idx_member_activity_company_id ON member_activity(company_id);
CREATE INDEX idx_member_activity_status ON member_activity(company_id, status);

-- RLS Policies
ALTER TABLE member_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company's data"
  ON member_activity FOR SELECT
  USING (company_id = current_setting('app.company_id')::TEXT);
```

---

## Performance & Data Usage Optimization

### Critical Performance Rules:

1. **Always Limit Query Results** (Most Important!)
```typescript
// ❌ WRONG - Fetches ALL rows (can be GBs of data!)
const { data } = await supabase
  .from('member_activity')
  .select('*')
  .eq('company_id', companyId);

// ✅ CORRECT - Limits to 1000 rows max
const { data } = await supabase
  .from('member_activity')
  .select('*')
  .eq('company_id', companyId)
  .limit(1000);
```

2. **Add Page-Level Caching**
```typescript
// Add to page.tsx files
export const dynamic = "force-dynamic";
export const revalidate = 60; // Cache for 60 seconds
```

3. **Never Use localStorage in Whop Apps**
```typescript
// ❌ WRONG - Breaks in Whop iframe
localStorage.setItem('key', 'value');

// ✅ CORRECT - Use React state
const [value, setValue] = useState('default');
```

### Monitoring Data Usage:
- Check Supabase dashboard → Settings → Usage
- Monitor "Database Egress" and "API Requests"
- Set up billing alerts for unusual spikes
- Expected usage for 1000 members: <100MB/day

---

## Testing Checklist

### Local Testing (Before Deploy):
- [ ] Run `pnpm build` - should succeed
- [ ] No TypeScript errors
- [ ] No console errors in browser
- [ ] App loads in Whop iframe (localhost mode)
- [ ] Member data displays correctly
- [ ] Filtering works
- [ ] Search works
- [ ] Mobile responsive

### Production Testing (After Deploy):
- [ ] All env variables set in Vercel
- [ ] Base URL updated in Whop dashboard
- [ ] App path set to `/experiences/[experienceId]`
- [ ] App loads in Whop iframe (production)
- [ ] Real member data loads
- [ ] No performance issues

---

## Common Errors & Fixes

### Error: "Invalid or missing user token"
**Fix**: Ensure WhopApp provider wraps your app in layout.tsx:
```typescript
// app/layout.tsx
import { WhopApp } from "@whop/react";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WhopApp>{children}</WhopApp>
      </body>
    </html>
  );
}
```

### Error: "Too many connections" (Database)
**Fix**: Verify Supabase URL contains "pooler":
```bash
# Good ✅
postgres://[user]:[pass]@[project].pooler.supabase.com

# Bad ❌
postgres://[user]:[pass]@[project].supabase.com
```

### Error: "App not loading in iframe"
**Fix**: 
1. Check Whop dashboard App path is EXACTLY: `/experiences/[experienceId]`
2. Verify Base URL is set (empty for localhost, full URL for production)
3. Clear browser cache

### Error: "Module not found: @whop/frosted-ui"
**Fix**: Install the package:
```bash
pnpm add @whop/frosted-ui
```

---

## Performance Guidelines

### Database Queries:
- Always use indexes on `company_id`
- Limit results with `.limit(100)`
- Use pagination for large datasets
- Cache frequently accessed data in memory (not localStorage!)

### API Calls:
- Batch requests where possible
- Use Whop webhooks instead of polling (post-MVP)
- Respect rate limits: 20 req/10sec (V5 API)

### UI Rendering:
- Use React.memo for expensive components
- Virtualize long lists with react-window (post-MVP)
- Lazy load images

---

## Deployment Process

1. **Commit and push:**
```bash
git add .
git commit -m "Initial MVP"
git push origin main
```

2. **Deploy to Vercel:**
```bash
vercel --prod
```

3. **Update Whop Dashboard:**
- Go to whop.com/dashboard/developer/
- Update Base URL to Vercel URL
- Verify App path: `/experiences/[experienceId]`

4. **Test in production:**
- Load app in Whop iframe
- Verify all features work
- Check browser console for errors

---

## Next Steps (After MVP Ships)

Priority order for v2 features:
1. Webhook listeners for real-time updates
2. Historical data tracking & charts
3. Email alerts for at-risk members
4. Content performance metrics
5. Churn prediction AI

**But first: Ship the MVP and get feedback!**

---

## Support Resources

- **Whop Docs**: https://dev.whop.com
- **Frosted UI**: https://storybook.whop.com
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

## Remember:
- Keep it simple
- Test incrementally
- Commit frequently
- Ship fast, iterate later
- The goal is a WORKING MVP, not perfect code

**Now let's build this! 🚀**