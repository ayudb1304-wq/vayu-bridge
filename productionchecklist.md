# VayuBridge — Production Checklist

> Complete every item before going live. Items marked **CRITICAL** will break the app if missed.

---

## 1. Environment Variables

### Must change from localhost/test values

| Variable | Current | Production Value | Used In |
|----------|---------|-----------------|---------|
| `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` | `https://yourdomain.com` | Webhooks, redirects, QStash callbacks |
| `AIRTABLE_REDIRECT_URI` | `http://localhost:3000/api/airtable/callback` | `https://yourdomain.com/api/airtable/callback` | OAuth flow |
| `DODO_ENVIRONMENT` | `test_mode` | `live_mode` | `lib/dodopayments.ts` |

### Must rotate / use production keys

| Variable | Where to get it |
|----------|----------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase project settings |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase project settings (keep secret) |
| `DODO_API_KEY` | Dodopayments dashboard (live key) |
| `DODO_WEBHOOK_SECRET` | Dodopayments dashboard (live webhook secret) |
| `QSTASH_TOKEN` | Upstash QStash console |
| `QSTASH_CURRENT_SIGNING_KEY` | Upstash QStash console |
| `QSTASH_NEXT_SIGNING_KEY` | Upstash QStash console |
| `CRON_SECRET` | Generate: `openssl rand -hex 32` |
| `RESEND_API_KEY` | Resend dashboard (if using email automations) |

### Verify correct values

| Variable | Notes |
|----------|-------|
| `AIRTABLE_CLIENT_ID` | From your Airtable OAuth app |
| `AIRTABLE_CLIENT_SECRET` | From your Airtable OAuth app |
| `TOKEN_ENCRYPTION_KEY` | 64-char hex string. **Back this up** — needed to decrypt stored tokens |
| `GROWTH_PRODUCT_ID` | Dodopayments live product ID |
| `SCALE_PRODUCT_ID` | Dodopayments live product ID |
| `QSTASH_URL` | Regional endpoint (e.g. `https://qstash-eu-central-1.upstash.io`) |

---

## 2. External Integration Configuration

### Supabase

- [ ] **CRITICAL** — Run all migrations in production SQL Editor:
  - `supabase/migrations/20260331_create_waitlist.sql`
  - `supabase/migrations/20260331_create_connected_bases.sql`
  - `supabase/migrations/20260331_create_sync_tables.sql`
  - `supabase/migrations/20260331_create_users.sql`
  - `supabase/migrations/20260331_create_automations.sql`
  - `supabase/migrations/20260401_add_dodo_columns.sql`
- [ ] Verify RLS is enabled on all tables
- [ ] **Authentication > URL Configuration**:
  - Site URL: `https://yourdomain.com`
  - Redirect URLs: `https://yourdomain.com/auth/callback`
- [ ] **Authentication > Providers > Google**:
  - Client ID and Client Secret from Google Cloud Console
- [ ] Set up database backups

### Google Cloud Console (OAuth)

- [ ] **APIs & Services > Credentials > OAuth 2.0 Client**:
  - Authorized redirect URI: `https://cjzxuiagzhblcsftwpib.supabase.co/auth/v1/callback`
- [ ] **OAuth consent screen**: Set to "Production" (not "Testing") for public access
- [ ] Add your production domain to authorized JavaScript origins

### Airtable OAuth App

- [ ] **CRITICAL** — Go to `airtable.com/create/oauth` and update:
  - Redirect URI: `https://yourdomain.com/api/airtable/callback`
- [ ] Verify scopes: `data.records:read`, `data.records:write`, `schema.bases:read`, `webhook:manage`

### Dodopayments

- [ ] **CRITICAL** — Switch to live mode in Dodopayments dashboard
- [ ] Set `DODO_ENVIRONMENT=live_mode` in Vercel
- [ ] Update `DODO_API_KEY` to live API key
- [ ] Create live products for Growth ($29/mo) and Scale ($79/mo) if not already done
- [ ] Update `GROWTH_PRODUCT_ID` and `SCALE_PRODUCT_ID` with live product IDs
- [ ] **Webhooks**: Register endpoint `https://yourdomain.com/api/webhooks/dodopayments`
- [ ] Subscribe to events: `subscription.active`, `subscription.cancelled`, `subscription.renewed`, `subscription.failed`, `subscription.expired`
- [ ] Copy live webhook secret to `DODO_WEBHOOK_SECRET`
- [ ] Test a real $29 transaction

### Upstash QStash

- [ ] Verify QStash can reach `https://yourdomain.com/api/sync/initial`
- [ ] Update signing keys if rotated

### Resend (Email)

- [ ] Create account and verify sending domain
- [ ] Set `RESEND_API_KEY` in Vercel env vars
- [ ] Update from address in `lib/automations.ts` line ~126 (`automations@vayubridge.com`)

---

## 3. Code Changes for Production

### Hardcoded URLs to update

| File | What to change |
|------|---------------|
| `app/layout.tsx` | `metadataBase`, `openGraph.url`, `alternates.canonical` — update to production domain |
| `lib/automations.ts` (~line 126) | Email `from` address — must match your verified Resend domain |

### Vercel Configuration

- [ ] Set all env vars in **Vercel > Project > Settings > Environment Variables**
- [ ] Configure custom domain in **Vercel > Project > Settings > Domains**
- [ ] Verify `vercel.json` cron schedule is correct:
  ```json
  { "crons": [{ "path": "/api/cron/publish-posts", "schedule": "0 9 * * 1" }] }
  ```
- [ ] Add poll-airtable cron if needed:
  ```json
  { "path": "/api/cron/poll-airtable", "schedule": "*/15 * * * *" }
  ```

---

## 4. Pre-Launch Testing

### Auth Flow
- [ ] Sign up with magic link — email received, link works, lands on dashboard
- [ ] Sign in with Google — OAuth flow completes, lands on dashboard
- [ ] Sign out — redirected to login page, session cleared
- [ ] Unauthenticated access to `/dashboard` — redirected to `/login`

### Payment Flow
- [ ] Click "Get Growth" on landing page (not logged in) → login → auto-checkout → Dodo payment page
- [ ] Click "Get Growth" on landing page (logged in) → direct to Dodo payment page
- [ ] Complete payment → webhook fires → `plan_tier` updated in DB
- [ ] Cancel subscription → webhook fires → downgraded to free
- [ ] Click "Upgrade" in dashboard sidebar → redirects to Dodo checkout

### Sync Flow
- [ ] Connect Airtable base via OAuth
- [ ] Trigger initial sync — progress updates in real-time
- [ ] Edit record in Airtable — webhook delivers change within 30s
- [ ] Fallback cron runs when webhook is stale

### Plan Enforcement
- [ ] Free user blocked from syncing >5,000 records
- [ ] Free user blocked from creating >5 automations
- [ ] Free user blocked from CSV/Excel export
- [ ] Growth user can export CSV/Excel
- [ ] Usage bar shows correct percentages
- [ ] Upgrade prompt appears at 80% usage

### Automations
- [ ] Create automation rule — saves to DB
- [ ] Trigger automation — HTTP POST action delivers payload
- [ ] Email action sends via Resend
- [ ] Disabled rules do not fire
- [ ] Run log shows correct status

---

## 5. Security Checklist

- [ ] All secrets are in Vercel env vars (not in code or git)
- [ ] `.env.local` is in `.gitignore`
- [ ] `TOKEN_ENCRYPTION_KEY` is backed up securely (loss = can't decrypt stored Airtable tokens)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is never exposed to the client
- [ ] Webhook endpoints verify signatures (Airtable HMAC, Dodo unwrap, QStash)
- [ ] Cron endpoints check `CRON_SECRET` header
- [ ] RLS enabled on all Supabase tables
- [ ] No CORS misconfigurations

---

## 6. Post-Launch Monitoring

- [ ] Set up error tracking (Sentry or similar)
- [ ] Monitor Supabase dashboard for query performance
- [ ] Monitor QStash queue for failed/stuck messages
- [ ] Monitor Dodopayments dashboard for failed payments
- [ ] Set up Vercel alerts for build failures
- [ ] Monitor webhook delivery rates (Airtable + Dodo)
- [ ] Check Vercel function logs for 500 errors in first 48 hours

---

## Quick Start: Minimum Steps to Go Live

1. Set all env vars in Vercel (see section 1)
2. Run all Supabase migrations
3. Update Supabase Auth URL config (site URL + redirect URLs)
4. Update Airtable OAuth redirect URI
5. Switch Dodo to live mode + register webhook
6. Update hardcoded URLs in `app/layout.tsx`
7. Configure custom domain on Vercel
8. Run full test suite (section 4)
9. Deploy

---

*VayuBridge Production Checklist — April 2026*
