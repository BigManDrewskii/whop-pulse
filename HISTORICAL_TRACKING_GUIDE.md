# 📈 Historical Engagement Tracking Guide

Complete guide for daily snapshots, trend analysis, and week-over-week comparisons.

---

## 🎯 What This Does

Creates daily snapshots of member engagement scores to enable:
- **Historical trend charts** (real data, not mock)
- **Week-over-week comparisons** (member growth, score changes)
- **Long-term analytics** (90-day retention)
- **Data-driven insights** (improving/declining trends)

---

## 🚀 Quick Setup (4 Steps)

### Step 1: Run Database Migration

Apply the `member_history` table to your Supabase:

1. Go to: https://supabase.com/dashboard/project/myztbjdquegymxuhybhv/editor
2. Click **SQL Editor** → **New Query**
3. Copy contents from `/Users/drewskii/whop-pulse/supabase/migrations/002_member_history.sql`
4. Click **Run** (or Cmd+Enter)

**What this creates:**
- `member_history` table (stores daily snapshots)
- Indexes for fast queries
- RLS policies for security
- `daily_engagement_trends` view
- Helper functions

### Step 2: Create Initial Snapshot

Seed your first snapshot with current data:

```bash
# Option A: Via API (manual trigger)
curl "http://localhost:3000/api/cron/daily-snapshot?secret=dev_cron_secret"

# Option B: Run SQL directly in Supabase
INSERT INTO member_history (company_id, member_id, engagement_score, status)
SELECT company_id, member_id, activity_score, status
FROM member_activity;
```

### Step 3: Add Cron Secret

Generate and add to `.env.local`:

```bash
# Generate secret
openssl rand -hex 32

# Add to .env.local (line 19)
CRON_SECRET=your_generated_secret_here
```

### Step 4: Configure Vercel Cron (Production)

1. Add `CRON_SECRET` to Vercel environment variables
2. Deploy: `vercel --prod`
3. Verify in Vercel Dashboard → Settings → Cron Jobs
4. Job runs daily at 2 AM UTC automatically

---

## 📊 Features Overview

### 1. Engagement Trend Chart (Updated)
**Location:** Dashboard → Top section

**Before:** Mock/demo data only
**Now:** Real historical data from `member_history` table

**Features:**
- Shows actual engagement trends over 7/30/90 days
- Fallback to mock data if no history yet
- "Demo Data" badge when using mock
- Real-time data fetching via `/api/history`

### 2. Week-over-Week Comparison (NEW!)
**Location:** Dashboard → Below chart, above stats

**Shows:**
- Total members (↑ +5 members)
- Average score (↑ +3.2 pts)
- Active count (↑ +2 members)
- At Risk count (↓ -1 members)
- Inactive count (→ 0 change)

**Visual Indicators:**
- 🟢 Green ↑ = Good change
- 🔴 Red ↓ = Bad change
- ⚪ Gray → = No change

### 3. Daily Snapshot System
**Runs:** Automatically every day at 2 AM UTC

**Process:**
1. Cron triggers `/api/cron/daily-snapshot`
2. Queries all members from `member_activity`
3. Inserts snapshot into `member_history`
4. Skips if snapshot already exists for today

**Manual Trigger:**
```bash
curl "https://your-app.vercel.app/api/cron/daily-snapshot?secret=YOUR_CRON_SECRET"
```

---

## 🗄️ Database Schema

### member_history Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| company_id | TEXT | Whop company ID (biz_*) |
| member_id | TEXT | Whop member ID (user_*) |
| engagement_score | INTEGER | Score at snapshot time (0-100) |
| status | TEXT | Status at snapshot time |
| recorded_at | TIMESTAMPTZ | When snapshot was taken |
| created_at | TIMESTAMPTZ | Record creation time |

### Indexes

- `idx_member_history_company_date` - Fast company queries
- `idx_member_history_member_date` - Individual member trends
- `idx_member_history_recorded_at` - Time-series queries

### daily_engagement_trends View

Pre-aggregated daily stats for fast chart loading:
```sql
SELECT * FROM daily_engagement_trends
WHERE company_id = 'biz_xxx'
ORDER BY date DESC
LIMIT 30;
```

---

## 🔧 API Endpoints

### GET /api/history

Get historical data for charts.

**Parameters:**
- `companyId` - Company ID (biz_*)
- `days` - Number of days (1-90, default 30)

**Request:**
```bash
curl "http://localhost:3000/api/history?companyId=biz_xxx&days=30"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "date": "Oct 15",
      "avg_score": 75.5,
      "total_members": 30,
      "active_count": 12,
      "at_risk_count": 10,
      "inactive_count": 8
    }
  ],
  "meta": {
    "company_id": "biz_xxx",
    "days_requested": 30,
    "data_points": 15,
    "using_mock": false
  }
}
```

### GET /api/comparison

Get week-over-week comparison.

**Parameters:**
- `companyId` - Company ID (biz_*)

**Request:**
```bash
curl "http://localhost:3000/api/comparison?companyId=biz_xxx"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "current": {
      "total": 35,
      "active": 15,
      "at_risk": 12,
      "inactive": 8,
      "avg_score": 68.5
    },
    "previous": {
      "total": 30,
      "active": 13,
      "at_risk": 11,
      "inactive": 6,
      "avg_score": 65.3
    },
    "changes": {
      "total": 5,
      "active": 2,
      "at_risk": 1,
      "inactive": 2,
      "avg_score": 3.2
    }
  }
}
```

### GET /api/cron/daily-snapshot

Create daily snapshot (protected by secret).

**Parameters:**
- `secret` - Cron secret (required)
- `companyId` - Company ID (optional, uses env var)

**Request:**
```bash
curl "http://localhost:3000/api/cron/daily-snapshot?secret=YOUR_SECRET"
```

**Response:**
```json
{
  "success": true,
  "message": "Created 30 snapshots",
  "data": {
    "company_id": "biz_xxx",
    "snapshot_count": 30,
    "duration_ms": 145,
    "timestamp": "2025-10-21T02:00:00Z"
  }
}
```

---

## 🧪 Testing

### Test Snapshot Creation

```bash
# Test locally (dev server must be running)
curl "http://localhost:3000/api/cron/daily-snapshot?secret=dev_cron_secret"

# Check Supabase dashboard
# Query: SELECT * FROM member_history ORDER BY recorded_at DESC LIMIT 10;
```

### Test Historical Chart

1. Create at least one snapshot
2. Reload dashboard
3. Chart should show real data (no "Demo Data" badge)
4. Hover over data points to see actual values

### Test Comparison View

1. Create snapshot today
2. Wait 7 days OR manually insert historical data:
```sql
-- Create fake snapshot from 7 days ago
INSERT INTO member_history (company_id, member_id, engagement_score, status, recorded_at)
SELECT
  company_id,
  member_id,
  activity_score,
  status,
  NOW() - INTERVAL '7 days'
FROM member_activity;
```
3. Reload dashboard
4. Should show week-over-week changes

---

## 📅 Automation Setup

### Vercel Cron (Recommended)

**Already configured in `vercel.json`:**
```json
{
  "crons": [{
    "path": "/api/cron/daily-snapshot?secret=$CRON_SECRET",
    "schedule": "0 2 * * *"
  }]
}
```

**Schedule:** Daily at 2 AM UTC

**Requirements:**
- Vercel Pro plan or higher
- `CRON_SECRET` environment variable set in Vercel

**Verify:**
1. Deploy to Vercel
2. Go to Project → Settings → Cron Jobs
3. Should see "daily-snapshot" listed
4. Check logs next day

### Alternative: GitHub Actions

Create `.github/workflows/daily-snapshot.yml`:
```yaml
name: Daily Snapshot
on:
  schedule:
    - cron: '0 2 * * *'
jobs:
  snapshot:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Snapshot
        run: |
          curl "${{ secrets.APP_URL }}/api/cron/daily-snapshot?secret=${{ secrets.CRON_SECRET }}"
```

### Alternative: External Cron (cron-job.org)

1. Go to: https://cron-job.org
2. Create free account
3. Add job:
   - URL: `https://your-app.vercel.app/api/cron/daily-snapshot?secret=YOUR_SECRET`
   - Schedule: Daily at 2 AM
4. Enable job

---

## 🔍 Data Retention

### Default: 90 Days

Snapshots older than 90 days are automatically cleaned up (optional).

### Manual Cleanup

```bash
# Cleanup via SQL
DELETE FROM member_history
WHERE recorded_at < NOW() - INTERVAL '90 days';
```

### Storage Estimate

- **Per snapshot:** ~100 bytes per member
- **Daily:** 100 members × 100 bytes = 10 KB
- **90 days:** 10 KB × 90 = 900 KB (~1 MB)
- **Negligible cost** for most use cases

---

## 📊 Chart Data Format

The chart expects data in this format:

```typescript
interface TrendDataPoint {
  date: string;          // "Oct 15"
  score: number;         // 75.5 (average)
  activeCount: number;   // 12
  atRiskCount: number;   // 10
  inactiveCount: number; // 8
}
```

Historical data is automatically transformed to this format by `getHistoricalData()`.

---

## 💡 Pro Tips

### Backfill Historical Data

If you already have member data, backfill snapshots:

```sql
-- Create snapshots for the past 30 days (simulated)
INSERT INTO member_history (company_id, member_id, engagement_score, status, recorded_at)
SELECT
  company_id,
  member_id,
  activity_score,
  status,
  NOW() - (random() * INTERVAL '30 days') -- Random time within 30 days
FROM member_activity;
```

### Custom Time Ranges

Update chart component to add custom ranges:
```tsx
<button onClick={() => setTimeRange(14)}>14D</button>
<button onClick={() => setTimeRange(60)}>60D</button>
```

### Export Historical Data

```bash
# Download as CSV from Supabase
SELECT * FROM daily_engagement_trends
WHERE company_id = 'biz_xxx'
ORDER BY date DESC;
```

---

## 🛠️ Troubleshooting

### Chart shows "Demo Data" badge

**Means:** No historical snapshots in database yet

**Solution:**
```bash
# Create first snapshot
curl "http://localhost:3000/api/cron/daily-snapshot?secret=dev_cron_secret"

# Refresh dashboard
```

### Comparison shows "Not enough data"

**Means:** No snapshots from 7 days ago

**Solution:**
- Wait 7 days for natural history buildup
- OR backfill historical data (see Pro Tips)

### Cron job not running

**Vercel specific:**
- Requires Vercel Pro plan
- Check Settings → Cron Jobs
- Verify `CRON_SECRET` is set
- Check function logs

**Alternative:** Use external cron service (see Automation Setup)

### Duplicate snapshots

**Symptom:** Multiple snapshots for same day

**Cause:** Cron running multiple times

**Solution:** Code already prevents this - checks for existing daily snapshot

---

## 📈 Analytics Queries

### Average Score Trend

```sql
SELECT
  DATE(recorded_at) as date,
  ROUND(AVG(engagement_score), 2) as avg_score
FROM member_history
WHERE company_id = 'biz_xxx'
  AND recorded_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(recorded_at)
ORDER BY date;
```

### Member Growth Over Time

```sql
SELECT
  DATE(recorded_at) as date,
  COUNT(DISTINCT member_id) as total_members
FROM member_history
WHERE company_id = 'biz_xxx'
GROUP BY DATE(recorded_at)
ORDER BY date;
```

### Status Distribution Over Time

```sql
SELECT
  DATE(recorded_at) as date,
  status,
  COUNT(*) as count
FROM member_history
WHERE company_id = 'biz_xxx'
  AND recorded_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(recorded_at), status
ORDER BY date, status;
```

---

## ✅ Setup Checklist

### Database
- [ ] Run `002_member_history.sql` migration
- [ ] Verify table exists in Supabase
- [ ] Create initial snapshot

### Environment
- [ ] `CRON_SECRET` generated and added to `.env.local`
- [ ] `CRON_SECRET` added to Vercel (production)

### Automation
- [ ] `vercel.json` committed to git
- [ ] Deployed to Vercel
- [ ] Cron job visible in Vercel dashboard
- [ ] First automatic snapshot completed

### UI
- [ ] Chart shows real data (no "Demo Data" badge)
- [ ] Comparison view shows changes
- [ ] Time range selector works (7D/30D/90D)

---

## 🎯 Expected Results

### Day 1 (Initial Setup)
- Chart: Shows demo data with "Demo Data" badge
- Comparison: "Not enough data yet"
- Action: Create first snapshot

### Day 2-6 (Early Tracking)
- Chart: Shows real trend for available days
- Comparison: Still "Not enough data"
- Snapshots: Growing daily

### Day 7+ (Full Functionality)
- Chart: Real historical data for 7/30/90 days
- Comparison: Week-over-week changes visible
- Trend indicators: ↑ ↓ → showing clearly

---

## 🔄 How It Works

### Daily Flow

```
2:00 AM UTC
   ↓
Vercel Cron triggers
   ↓
/api/cron/daily-snapshot
   ↓
Check if snapshot exists for today
   ↓
NO → Query all members from member_activity
   ↓
Insert snapshots into member_history
   ↓
Success (30 snapshots created)
```

### Chart Loading

```
User opens dashboard
   ↓
Chart component fetches /api/history
   ↓
Query member_history for last 30 days
   ↓
Use daily_engagement_trends view
   ↓
Return aggregated data
   ↓
Chart displays real trends
```

---

## 📱 User Experience

### With Historical Data
- Opens dashboard → Chart shows real trends
- Sees actual engagement patterns
- Week comparison shows growth/decline
- Data-driven decision making

### Without Historical Data (First Week)
- Opens dashboard → Chart shows demo data
- Badge indicates "Demo Data"
- Message: "Historical tracking starts after first snapshot"
- Graceful degradation

---

## 🚀 Production Deployment

### Pre-Deploy
- [ ] Migration applied to production Supabase
- [ ] `CRON_SECRET` added to Vercel env vars
- [ ] `vercel.json` committed to git

### Deploy
```bash
git add .
git commit -m "Add historical engagement tracking"
vercel --prod
```

### Post-Deploy
- [ ] Verify cron job in Vercel dashboard
- [ ] Manually trigger first snapshot
- [ ] Wait 24 hours for second snapshot
- [ ] Verify chart shows real data

---

## 📞 Need Help?

### Common Commands

```bash
# Create manual snapshot
curl "http://localhost:3000/api/cron/daily-snapshot?secret=dev_cron_secret"

# Check historical data
curl "http://localhost:3000/api/history?companyId=biz_xxx&days=30"

# Get comparison
curl "http://localhost:3000/api/comparison?companyId=biz_xxx"

# Query database directly
# Supabase SQL Editor:
SELECT * FROM daily_engagement_trends WHERE company_id = 'biz_xxx';
```

### Useful SQL Queries

```sql
-- Count snapshots by day
SELECT DATE(recorded_at), COUNT(*)
FROM member_history
GROUP BY DATE(recorded_at)
ORDER BY DATE(recorded_at) DESC;

-- View latest snapshot
SELECT * FROM member_history
ORDER BY recorded_at DESC
LIMIT 10;

-- Check daily trends
SELECT * FROM daily_engagement_trends
WHERE company_id = 'biz_xxx'
ORDER BY date DESC;
```

---

## 🎉 Summary

You now have:
- ✅ Daily automated snapshots
- ✅ Historical trend charts with real data
- ✅ Week-over-week comparison view
- ✅ 90-day data retention
- ✅ Optimized queries with indexes
- ✅ Fallback to demo data when needed

**Storage impact:** ~1MB per year for 100 members
**Performance:** <100ms query times with indexes

Happy tracking! 📈
