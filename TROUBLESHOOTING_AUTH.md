# Troubleshooting: "Invalid app id provided to verifyUserToken"

This guide will help you fix the authentication error in production.

## Quick Diagnosis

Visit these URLs to check your setup:

1. **Local**: http://localhost:3000/api/debug/env
2. **Production**: https://your-app.vercel.app/api/debug/env

This will show you which environment variables are loaded and any validation errors.

## Common Causes & Solutions

### 1. Environment Variables Not Set in Vercel ⚠️ MOST COMMON

**Problem**: You set environment variables locally in `.env.local`, but forgot to set them in Vercel.

**Solution**:
1. Go to your Vercel dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```bash
# Required for Auth (must match your Whop app)
NEXT_PUBLIC_WHOP_APP_ID=app_xxxxxxxxxxxxx
NEXT_PUBLIC_WHOP_CLIENT_ID=app_xxxxxxxxxxxxx  # Same as APP_ID
WHOP_API_KEY=your_api_key_here
WHOP_CLIENT_SECRET=your_client_secret_here

# Required for Company
NEXT_PUBLIC_WHOP_COMPANY_ID=biz_xxxxxxxxxxxxx

# Required for Database
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here

# Required for Auth
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your_secret_here

# Optional
NEXT_PUBLIC_WHOP_AGENT_USER_ID=user_xxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Set scope to **All** environments (Production, Preview, Development)
5. Click **Save**
6. **IMPORTANT**: Redeploy your app after adding variables

```bash
vercel --prod
```

---

### 2. Environment Variables Need Rebuild

**Problem**: You added environment variables but didn't redeploy.

**Solution**:
1. After adding/changing environment variables in Vercel
2. Go to **Deployments** tab
3. Find your latest deployment
4. Click the **⋯** menu → **Redeploy**
5. OR: Push a new commit or run `vercel --prod`

**Why**: Next.js bundles NEXT_PUBLIC_ variables at build time. Changes require a rebuild.

---

### 3. Wrong App ID Format

**Problem**: Your `NEXT_PUBLIC_WHOP_APP_ID` doesn't start with `app_`

**Solution**:
1. Go to https://whop.com/dashboard/developer
2. Select your app
3. Go to **App Settings** → **API Keys**
4. Copy the **App ID** (should start with `app_`)
5. Make sure you're using the App ID, NOT the Client ID (though they might be the same)

**Format validation**:
- ✅ `app_abc123def456ghi789`
- ❌ `biz_abc123` (this is a company ID)
- ❌ `user_abc123` (this is a user ID)

---

### 4. Mixing Up CLIENT_ID and APP_ID

**Problem**: You set `NEXT_PUBLIC_WHOP_CLIENT_ID` but not `NEXT_PUBLIC_WHOP_APP_ID`

**Solution**:
- Both should be set to the **same value** (your app ID from Whop dashboard)
- Example:
  ```bash
  NEXT_PUBLIC_WHOP_APP_ID=app_abc123
  NEXT_PUBLIC_WHOP_CLIENT_ID=app_abc123
  ```

---

### 5. Vercel Environment Not Selected

**Problem**: You set variables for "Production" only, but testing on a preview deploy

**Solution**:
1. When adding environment variables in Vercel
2. Make sure to check **ALL** of these:
   - ☑️ Production
   - ☑️ Preview
   - ☑️ Development
3. This ensures variables work in all deploy environments

---

### 6. Whop App Configuration Mismatch

**Problem**: Your Vercel app URL doesn't match what's configured in Whop dashboard

**Solution**:
1. Go to https://whop.com/dashboard/developer
2. Select your app
3. Go to **App Settings** → **OAuth & Permissions**
4. Make sure **Redirect URI** includes your Vercel URL:
   ```
   https://your-app.vercel.app
   ```
5. Go to **App Settings** → **General**
6. Set **Base URL** to:
   ```
   https://your-app.vercel.app
   ```
7. Set **App Path** to:
   ```
   /experiences/[experienceId]
   ```

---

### 7. API Key vs Client Secret Confusion

**Problem**: You mixed up `WHOP_API_KEY` and `WHOP_CLIENT_SECRET`

**Solution**:
These are **different** values from Whop dashboard:

- **WHOP_API_KEY**: From **API Keys** section (used for server-side API calls)
- **WHOP_CLIENT_SECRET**: From **OAuth & Permissions** section (used for OAuth)

Both are required. Don't use the same value for both.

---

## Step-by-Step Verification

### Local Testing:

1. **Check your `.env.local` file**:
   ```bash
   cat .env.local | grep WHOP
   ```

2. **Start dev server and check logs**:
   ```bash
   pnpm dev
   ```

   Look for:
   ```
   [Whop SDK] NEXT_PUBLIC_WHOP_APP_ID: app_xxxxx
   [Whop SDK] Initialization complete
   ```

3. **Visit debug endpoint**:
   ```
   http://localhost:3000/api/debug/env
   ```

4. **Check for warnings**:
   - Should see `has_app_id: true`
   - Should see `appId_valid: true`
   - No critical warnings

### Production Testing:

1. **Check Vercel logs**:
   ```bash
   vercel logs your-app-name --prod
   ```

2. **Look for SDK initialization logs**:
   ```
   [Whop SDK] NEXT_PUBLIC_WHOP_APP_ID: app_xxxxx
   ```

3. **If you see `undefined` or `fallback`**:
   - Environment variables are NOT set in Vercel
   - Go back to "Environment Variables Not Set in Vercel" section

4. **Visit production debug endpoint**:
   ```
   https://your-app.vercel.app/api/debug/env
   ```

5. **Check response**:
   ```json
   {
     "validation": {
       "has_app_id": true,  // ← Must be true
       "has_api_key": true,  // ← Must be true
       "appId_valid": true   // ← Must be true
     }
   }
   ```

---

## Still Not Working?

### Check Console Logs

With the debug logging added, check your console for:

```
[Experience Page] Environment check:
[Experience Page] NEXT_PUBLIC_WHOP_APP_ID: ???  ← What does this show?
```

### Common Log Patterns:

**If you see `undefined`**:
- Environment variable not set
- → Go to Vercel dashboard and add it

**If you see `fallback`**:
- Using the fallback value (bad)
- → Environment variable not properly loaded

**If you see `app_xxxxxxx`**:
- App ID is loaded correctly
- → Issue might be with Whop app configuration or API key

### Get Help:

1. **Check logs**: `vercel logs --prod`
2. **Visit debug endpoint**: `/api/debug/env`
3. **Copy the error message** from browser console
4. **Check Whop dashboard** that your app is enabled
5. **Verify API keys** haven't been regenerated

---

## Checklist

Before deploying, verify:

- [ ] All environment variables set in Vercel
- [ ] Variables set for all environments (Production, Preview, Development)
- [ ] `NEXT_PUBLIC_WHOP_APP_ID` starts with `app_`
- [ ] `NEXT_PUBLIC_WHOP_COMPANY_ID` starts with `biz_`
- [ ] Vercel Base URL matches Whop app configuration
- [ ] App Path is `/experiences/[experienceId]` in Whop dashboard
- [ ] Redeployed after adding environment variables
- [ ] `/api/debug/env` shows all variables as SET
- [ ] No "CRITICAL ERROR" messages in logs

---

## Security Note

**After debugging, consider removing or protecting the `/api/debug/env` endpoint** to avoid exposing configuration in production.

Add to `middleware.ts`:
```typescript
if (pathname === '/api/debug/env' && process.env.NODE_ENV === 'production') {
  return NextResponse.json({ error: 'Not available' }, { status: 403 });
}
```

Or delete the file:
```bash
rm app/api/debug/env/route.ts
```
