# Whop-to-Supabase Sync Guide

Complete guide for syncing Whop member data to Supabase with automatic engagement scoring.

---

## 📋 What This Does

Automatically syncs member data from your Whop community to Supabase database:
- Fetches all members from Whop API
- Calculates engagement scores based on last activity
- Assigns status (Active/At Risk/Inactive)
- Upserts to Supabase (creates or updates records)

---

## 🚀 Quick Start

### 1. Set up Service Role Key

Add your Supabase service role key to `.env.local`:

```bash
# Get from: Supabase Dashboard > Project Settings > API > service_role key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** This bypasses RLS for server-side writes. Never expose to client!

### 2. Test the Sync (CLI)

Run the test script to sync members:

```bash
pnpm sync
```

Expected output:
```
🧪 Testing Whop-to-Supabase Sync

📊 Step 1: Getting stats before sync...
   Before sync:
   - Total members: 0
   - Active: 0
   ...

🔄 Step 2: Running sync from Whop...
   Sync completed in 1234ms

📋 Step 3: Sync Results:
   Success: ✅
   Members synced: 25
   Skipped: 0
   Errors: 0

✅ Test completed successfully!
```

### 3. Add Sync Button to Your App

Add to any settings page:

```tsx
// app/experiences/[experienceId]/settings/page.tsx
import { SyncButton } from "@/components/SyncButton";

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Member Data</h2>
      <p className="text-gray-600 mb-4">
        Sync member data from Whop to update engagement scores
      </p>

      <SyncButton
        companyId={companyId}
        onSyncComplete={(result) => {
          console.log("Synced:", result.data.synced_count, "members");
          // Optionally refresh page
          window.location.reload();
        }}
      />
    </div>
  );
}
```

---

## 📊 How Engagement Scoring Works

### Formula
```
score = max(0, 100 - (days_since_active * 3))
```

### Status Breakdown

| Days Since Active | Score | Status    | Color  |
|-------------------|-------|-----------|--------|
| 0-7 days          | 80-100| Active    | Green  |
| 8-30 days         | 40-79 | At Risk   | Yellow |
| 31+ days          | 0-39  | Inactive  | Red    |

### Example Calculations

- Last active **2 days ago**:
  - Score: `100 - (2 * 3) = 94`
  - Status: **Active** ✅

- Last active **15 days ago**:
  - Score: `100 - (15 * 3) = 55`
  - Status: **At Risk** ⚠️

- Last active **45 days ago**:
  - Score: `100 - (45 * 3) = 0` (max applies)
  - Status: **Inactive** ❌

---

## 🔌 API Endpoints

### POST /api/sync-members

Triggers a sync of Whop members to Supabase.

**Authentication:** Requires valid Whop token in headers

**Rate Limit:** 1 request per minute per company

**Request:**
```bash
curl -X POST http://localhost:3000/api/sync-members \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WHOP_TOKEN" \
  -d '{"companyId": "biz_xxx"}'
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Successfully synced 25 members",
  "data": {
    "synced_count": 25,
    "skipped_count": 0,
    "duration_ms": 1234,
    "stats": {
      "total": 25,
      "active": 10,
      "at_risk": 8,
      "inactive": 7,
      "last_synced": "2025-10-21T10:30:00Z"
    }
  }
}
```

**Response (Rate Limited):**
```json
{
  "error": "Rate limit exceeded",
  "message": "Please wait 45 seconds before syncing again",
  "retry_after": 45
}
```

### GET /api/sync-members?companyId=biz_xxx

Get sync stats without triggering a sync.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "total": 25,
      "active": 10,
      "at_risk": 8,
      "inactive": 7,
      "last_synced": "2025-10-21T10:30:00Z"
    },
    "can_sync": true
  }
}
```

---

## 🔧 Functions

### Core Functions (lib/whop-sync.ts)

#### `calculateEngagementScore(daysSinceActive: number)`
Calculates score and status based on days.

```ts
const { score, status } = calculateEngagementScore(15);
// Returns: { score: 55, status: "at_risk" }
```

#### `syncMembersFromWhop(companyId: string)`
Main sync function. Fetches from Whop, transforms, and upserts to Supabase.

```ts
const result = await syncMembersFromWhop("biz_xxx");
console.log(`Synced ${result.count} members`);
```

**Returns:**
```ts
{
  success: boolean;
  count: number;
  errors: any[];
  skipped: number;
}
```

#### `getSyncStats(companyId: string)`
Get current database statistics.

```ts
const stats = await getSyncStats("biz_xxx");
console.log(`Total: ${stats.total}, Active: ${stats.active}`);
```

---

## 🛠️ Troubleshooting

### No members synced (count: 0)

**Check:**
1. Whop API credentials are correct
2. Company actually has members
3. Check console logs for API errors

**Debug:**
```bash
pnpm sync
# Look for "[Whop Sync] Found X members from Whop"
```

### RLS Policy Error

**Error:** `new row violates row-level security policy`

**Fix:** Make sure you set the service role key:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_key_here
```

### Rate Limit Hit

**Error:** `Rate limit exceeded`

**Solution:** Wait 60 seconds or adjust `RATE_LIMIT_MS` in API route.

### Authentication Failed

**Error:** `Authentication required`

**Check:**
1. Whop token is being sent in request
2. Token is valid and not expired
3. User has access to the company

---

## 📅 Automation

### Option 1: Cron Job (Vercel)

Create `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/sync-members",
    "schedule": "0 */6 * * *"
  }]
}
```

This syncs every 6 hours automatically.

### Option 2: Manual Button

Use the `<SyncButton>` component in your settings page (see Quick Start #3).

### Option 3: CLI Script

Add to your deployment scripts:
```bash
pnpm sync
```

---

## 🔒 Security Notes

### Service Role Key
- ✅ Used server-side only (never sent to browser)
- ✅ Bypasses RLS (appropriate for trusted server code)
- ✅ Protected by Whop authentication before use
- ❌ Never commit to git
- ❌ Never expose in client-side code

### API Route Security
1. **Authentication:** Validates Whop token
2. **Authorization:** Checks user has company access
3. **Rate Limiting:** Prevents abuse (1 req/min)
4. **Error Handling:** Doesn't leak sensitive info

---

## 📈 Monitoring

### Check Sync Health

Run test script:
```bash
pnpm sync
```

### View Logs

Server logs show:
```
[Whop Sync] Starting sync for company: biz_xxx
[Whop Sync] Found 25 members from Whop
[Whop Sync] Transformed 25 members (0 skipped)
[Whop Sync] Successfully synced 25 members
```

### Supabase Dashboard

View synced data:
https://supabase.com/dashboard/project/myztbjdquegymxuhybhv/editor

Check `member_activity` table.

---

## 🎯 Next Steps

1. ✅ Test sync works: `pnpm sync`
2. ✅ Add `<SyncButton>` to settings page
3. ✅ Set up automated syncing (cron or schedule)
4. ✅ Monitor sync health periodically
5. ✅ Adjust engagement scoring formula if needed

---

## 💡 Tips

- **First sync:** May take longer if many members
- **Regular syncs:** Run daily or weekly to keep data fresh
- **Engagement scores:** Adjust formula in `calculateEngagementScore()` if needed
- **Custom fields:** Add more fields to `MemberData` interface as needed

---

## 📞 Support

Issues? Check:
1. Console logs for detailed error messages
2. Supabase dashboard for RLS issues
3. Whop API docs for data structure changes

Happy syncing! 🚀
