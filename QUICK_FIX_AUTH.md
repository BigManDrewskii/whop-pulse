# 🚨 QUICK FIX: Invalid App ID Error

## Most Likely Cause (90% of cases)

**Environment variables are NOT set in Vercel dashboard.**

## Immediate Action

### 1. Visit Debug Endpoint
Open this in your browser:
```
https://your-app.vercel.app/api/debug/env
```

Look at the response - if you see:
```json
"NEXT_PUBLIC_WHOP_APP_ID": "NOT SET"
```
or
```json
"has_app_id": false
```

**→ This is your problem!**

---

### 2. Fix in Vercel (5 minutes)

Go to: https://vercel.com/[your-team]/[your-project]/settings/environment-variables

Click **"Add New"** and add each of these:

| Key | Value | Example |
|-----|-------|---------|
| `NEXT_PUBLIC_WHOP_APP_ID` | Your app ID from Whop | `app_abc123xyz789` |
| `NEXT_PUBLIC_WHOP_CLIENT_ID` | Same as APP_ID | `app_abc123xyz789` |
| `NEXT_PUBLIC_WHOP_COMPANY_ID` | Your company ID from Whop | `biz_abc123xyz789` |
| `WHOP_API_KEY` | API key from Whop dashboard | `whop_...` |
| `WHOP_CLIENT_SECRET` | Client secret from Whop | `...` |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anon key | `eyJ...` |
| `NEXTAUTH_URL` | Your Vercel URL | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Random secret | Generate with `openssl rand -base64 32` |

**IMPORTANT**: For each variable, check ALL THREE environments:
- ✅ Production
- ✅ Preview
- ✅ Development

---

### 3. Redeploy

After adding variables:

```bash
vercel --prod
```

OR go to Vercel dashboard → Deployments → click ⋯ on latest deployment → Redeploy

**Why**: Next.js bundles `NEXT_PUBLIC_*` variables at build time.

---

### 4. Verify Fix

Visit again:
```
https://your-app.vercel.app/api/debug/env
```

Should now see:
```json
{
  "variables": {
    "NEXT_PUBLIC_WHOP_APP_ID": "app_abc123xyz789"
  },
  "validation": {
    "has_app_id": true,
    "appId_valid": true
  },
  "warnings": []
}
```

---

## Where to Get Whop Values

Go to: https://whop.com/dashboard/developer → Select your app

| Value | Location |
|-------|----------|
| App ID | **API Keys** section → copy "App ID" |
| API Key | **API Keys** section → copy "API Key" |
| Client Secret | **OAuth & Permissions** → copy "Client Secret" |
| Company ID | Your company URL: `https://whop.com/[company-name]/` → inspect element to find `biz_xxxxx` |

---

## If Still Broken

1. Check Vercel logs: `vercel logs --prod`
2. Look for: `[Whop SDK] NEXT_PUBLIC_WHOP_APP_ID: ???`
3. If it shows `undefined` → variables still not set
4. If it shows `app_xxxxx` → different issue (see TROUBLESHOOTING_AUTH.md)

---

## After Fix: Clean Up

Once working, protect or remove the debug endpoint:

```bash
rm app/api/debug/env/route.ts
git add .
git commit -m "Remove debug endpoint"
git push
```
