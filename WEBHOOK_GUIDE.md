# Whop Webhook Integration Guide

Complete guide for setting up real-time member activity updates via Whop webhooks.

---

## 🎯 What This Does

Automatically updates member data in real-time when:
- ✅ New member joins (membership.went_valid)
- ✅ Member logs in/accesses (membership.accessed)
- ✅ Member expires/cancels (membership.went_invalid)

**Benefits:**
- No manual syncing needed
- Real-time engagement scores
- Instant status updates
- Always accurate member data

---

## 🚀 Quick Setup

### Step 1: Add Webhook Secret

Generate a secure webhook secret:

```bash
# Generate random secret
openssl rand -hex 32
```

Add to `.env.local`:
```bash
WHOP_WEBHOOK_SECRET=your_generated_secret_here
```

### Step 2: Configure Webhook in Whop Dashboard

1. Go to [Whop Developer Dashboard](https://whop.com/dashboard/developer/)
2. Select your app
3. Go to **Webhooks** section
4. Click **Add Webhook**
5. Configure:
   - **URL:** `https://your-app.vercel.app/api/webhooks/whop`
   - **Secret:** (paste your `WHOP_WEBHOOK_SECRET`)
   - **Events:** Select these events:
     - ☑️ `membership.went_valid`
     - ☑️ `membership.accessed`
     - ☑️ `membership.went_invalid`
6. Click **Save**

### Step 3: Test Locally (Development)

Use ngrok to expose local server:

```bash
# Terminal 1: Start dev server
pnpm dev

# Terminal 2: Start ngrok
ngrok http 3000

# Copy ngrok URL (e.g., https://abc123.ngrok.io)
# Update Whop webhook URL to: https://abc123.ngrok.io/api/webhooks/whop
```

Test with mock events:
```bash
# Test new member event
pnpm test:webhook membership.went_valid

# Test login event
pnpm test:webhook membership.accessed

# Test expiration event
pnpm test:webhook membership.went_invalid

# Test all events
pnpm test:webhook all
```

---

## 📋 Webhook Events

### 1. membership.went_valid (New Member)

**When triggered:** Member subscribes/gains access

**Actions performed:**
- Creates new member record in database
- Sets engagement_score to 100 (new member)
- Sets status to "active"
- Records join date

**Example payload:**
```json
{
  "action": "membership.went_valid",
  "data": {
    "id": "membership_xxx",
    "user_id": "user_xxx",
    "company_id": "biz_xxx",
    "email": "member@example.com",
    "username": "membername",
    "created_at": "2025-10-21T10:00:00Z"
  }
}
```

### 2. membership.accessed (Member Activity)

**When triggered:** Member logs in or accesses resources

**Actions performed:**
- Updates `last_active` to now
- Recalculates engagement_score (→ 100)
- Updates status (inactive → at_risk → active)
- Increments `total_sessions` counter

**Example payload:**
```json
{
  "action": "membership.accessed",
  "data": {
    "id": "membership_xxx",
    "user_id": "user_xxx",
    "company_id": "biz_xxx",
    "accessed_at": "2025-10-21T10:00:00Z"
  }
}
```

### 3. membership.went_invalid (Expired/Cancelled)

**When triggered:** Membership expires or is cancelled

**Actions performed:**
- Sets status to "inactive"
- Sets engagement_score to 0
- Keeps historical record (doesn't delete)

**Example payload:**
```json
{
  "action": "membership.went_invalid",
  "data": {
    "id": "membership_xxx",
    "user_id": "user_xxx",
    "company_id": "biz_xxx",
    "expired_at": "2025-10-21T10:00:00Z"
  }
}
```

---

## 🔒 Security

### Webhook Signature Verification

All webhooks are verified using HMAC-SHA256:

```typescript
// Automatic verification in webhook route
const validateWebhook = makeWebhookValidator({
  webhookSecret: process.env.WHOP_WEBHOOK_SECRET
});

const webhookData = await validateWebhook(request);
// If invalid, throws error and rejects webhook
```

**Why this matters:**
- Prevents spoofed webhooks
- Ensures events are from Whop
- Protects against malicious data

### Best Practices

1. ✅ **Use strong secret:** Generate with `openssl rand -hex 32`
2. ✅ **Keep secret secure:** Never commit to git
3. ✅ **HTTPS only:** Always use HTTPS in production
4. ✅ **Verify signatures:** Already implemented in route
5. ✅ **Return 200 quickly:** Prevents retry storms

---

## 🧪 Testing

### Local Testing with Mock Events

```bash
# Test single event
pnpm test:webhook membership.went_valid

# Test all events
pnpm test:webhook all
```

Expected output:
```
🧪 Testing Webhook: membership.went_valid

📦 Payload:
{
  "action": "membership.went_valid",
  "data": { ... }
}

🔐 Signature: abc123...
📍 Sending to: http://localhost:3000/api/webhooks/whop

📊 Response Status: 200
📋 Response Body:
{
  "received": true,
  "event": "membership.went_valid",
  "duration_ms": 123
}

✅ Webhook processed successfully!
```

### Production Testing with ngrok

**Step 1: Install ngrok**
```bash
# macOS
brew install ngrok

# Or download from: https://ngrok.com/download
```

**Step 2: Expose local server**
```bash
# Start dev server
pnpm dev

# In another terminal, start ngrok
ngrok http 3000
```

**Step 3: Update Whop webhook URL**
```
Copy ngrok URL: https://abc123.ngrok.io
Go to Whop Dashboard → Webhooks
Update URL to: https://abc123.ngrok.io/api/webhooks/whop
```

**Step 4: Trigger real events**
- Join as a test member
- Access the community
- Cancel membership
- Watch console logs for webhook processing

### Verify Webhooks Work

Check database after webhook:
```sql
-- Check latest member updates
SELECT member_name, status, activity_score, last_active, updated_at
FROM member_activity
ORDER BY updated_at DESC
LIMIT 10;
```

---

## 📊 Monitoring

### Check Webhook Logs

Server logs show webhook processing:
```
[Webhook] Validated webhook: membership.accessed
[Webhook] Processing event: membership.accessed
[Webhook] Handling membership.accessed event
[Webhook] Member activity updated: user_xxx (score: 100)
[Webhook] Processed in 45ms
```

### Webhook Endpoint Health Check

```bash
# GET request to check webhook status
curl https://your-app.vercel.app/api/webhooks/whop

# Response:
{
  "status": "ok",
  "webhook_endpoint": "/api/webhooks/whop",
  "supported_events": [
    "membership.went_valid",
    "membership.accessed",
    "membership.went_invalid"
  ]
}
```

### Whop Dashboard Webhook Logs

1. Go to Whop Dashboard → Webhooks
2. Click on your webhook
3. View **Recent Deliveries**
4. Check status codes and retry attempts

---

## 🛠️ Troubleshooting

### Webhook not receiving events

**Check:**
1. ✅ Webhook URL is correct and accessible
2. ✅ HTTPS enabled (required in production)
3. ✅ Correct events selected in Whop dashboard
4. ✅ Webhook secret matches `.env.local`

**Debug:**
```bash
# Test webhook endpoint health
curl https://your-app.vercel.app/api/webhooks/whop

# Check if ngrok is running (dev)
curl https://your-ngrok-url.ngrok.io/api/webhooks/whop
```

### Signature validation fails

**Error:** `Invalid signature`

**Fixes:**
1. Verify `WHOP_WEBHOOK_SECRET` matches Whop dashboard
2. Check webhook secret is set in Vercel env vars (production)
3. Ensure no extra spaces or newlines in secret

### Member data not updating

**Check:**
1. Webhook returns 200 OK
2. Check server logs for errors
3. Verify `SUPABASE_SERVICE_ROLE_KEY` is set
4. Check Supabase database for RLS issues

**Debug:**
```bash
# Check recent webhook logs
# Look for error messages in console

# Verify database connection
pnpm tsx scripts/test-connection.ts
```

### Retry storms (too many webhooks)

**Cause:** Webhook taking >30 seconds or returning errors

**Fix:**
- Webhook route always returns 200 OK (even on error)
- Processing happens quickly (<1 second)
- Long-running tasks should use background jobs

---

## 🔄 Webhook Flow

```
1. Member Event in Whop
   ↓
2. Whop sends webhook → /api/webhooks/whop
   ↓
3. Verify signature (HMAC-SHA256)
   ↓
4. Route to event handler
   ↓
5. Update Supabase database
   ↓
6. Return 200 OK (< 1 second)
   ↓
7. Member data updated in real-time!
```

---

## 📈 Performance

### Response Time
- **Target:** < 1 second
- **Average:** 50-200ms
- **Max allowed:** 30 seconds (Whop timeout)

### Idempotency
Webhooks can be processed multiple times safely:
- Uses `upsert` operations
- Same event = same result
- No duplicate members

### Rate Limiting
No rate limiting needed - Whop controls event frequency.

---

## 🚀 Production Deployment

### Step 1: Set Environment Variables

In Vercel/your hosting platform:
```bash
WHOP_WEBHOOK_SECRET=your_production_secret
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_WHOP_COMPANY_ID=biz_xxx
```

### Step 2: Deploy

```bash
# Commit changes
git add .
git commit -m "Add Whop webhook integration"
git push

# Deploy to Vercel
vercel --prod
```

### Step 3: Update Whop Webhook URL

1. Go to Whop Dashboard → Webhooks
2. Update URL to production: `https://your-app.vercel.app/api/webhooks/whop`
3. Test with a real membership event
4. Verify in Supabase dashboard

### Step 4: Monitor

- Check Vercel logs for webhook processing
- Monitor Supabase for data updates
- Check Whop dashboard for delivery status

---

## 💡 Tips

### Combine with Manual Sync

Use both webhooks + manual sync:
- **Webhooks:** Real-time updates (new data)
- **Manual Sync:** Backfill historical data

```tsx
// Settings page
<SyncButton /> // For historical data
// Webhooks handle new events automatically
```

### Handle Webhook Failures

Store failed webhooks for debugging:
```typescript
// Add to webhook route
await supabase.from('webhook_failures').insert({
  event_type: eventType,
  error: error.message,
  payload: JSON.stringify(webhookData),
  timestamp: new Date().toISOString()
});
```

### Test Before Production

1. ✅ Test with ngrok locally
2. ✅ Verify all 3 event types work
3. ✅ Check database updates
4. ✅ Monitor logs for errors
5. ✅ Deploy to staging first

---

## 📞 Support

### Common Issues

| Issue | Solution |
|-------|----------|
| 403 Forbidden | Check webhook signature/secret |
| 500 Server Error | Check server logs, verify env vars |
| Timeout | Webhook too slow, optimize database queries |
| Duplicate events | Normal! Route is idempotent |

### Resources

- [Whop Webhooks Docs](https://dev.whop.com/webhooks)
- [Whop Dashboard](https://whop.com/dashboard/developer/)
- [Ngrok Download](https://ngrok.com/download)
- [HMAC Signature Verification](https://en.wikipedia.org/wiki/HMAC)

---

## ✅ Checklist

Setup complete when:
- [ ] Webhook secret generated and added to `.env.local`
- [ ] Webhook configured in Whop dashboard
- [ ] All 3 events selected
- [ ] Tested locally with mock events
- [ ] Tested with ngrok and real events
- [ ] Deployed to production
- [ ] Production webhook URL updated
- [ ] Verified with real membership event

---

Happy webhooking! 🎉
