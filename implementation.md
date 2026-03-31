# VayuBridge — Implementation Tracker

> One developer. 14-day MVP. Track every task, every exit gate.

**Stack:** Next.js 16 (App Router) · Supabase · Tailwind v4 · shadcn/ui (radix-mira, neutral) · Dodopayments · Upstash QStash · Resend
**Theme:** Light — white/slate, Stripe-like, asymmetric premium layout
**Fonts:** Geist (body) · Geist Mono (headings/accents) · JetBrains Mono (code)

---

## How to Use This File

- Check off `[ ]` → `[x]` as tasks complete
- Each phase has **Exit Criteria** — the phase is not done until ALL criteria pass
- Sub-tasks are sequenced; follow order within a phase
- `[shadcn]` tags indicate which shadcn components are required

---

## Phase 0 — Foundation & Theme ✦

> Set the design system baseline before building any UI. Every component inherits from this.

### Tasks

- [x] Next.js 16 project initialized with App Router, TypeScript, Tailwind v4
- [x] shadcn/ui configured (`radix-mira` style, neutral base, CSS variables)
- [x] `Button` component installed
- [x] `next-themes` installed, `ThemeProvider` wired in layout
- [x] `tw-animate-css` installed
- [x] Update CSS variable palette to light/neutral premium theme (slate-900 primary, not coral)
  - Change `--primary` → `oklch(0.145 0 0)` (near-black slate, matching foreground)
  - Change `--accent` → `oklch(0.967 0 0)` (light grey accent)
  - Change `--primary-foreground` → `oklch(1 0 0)` (white)
  - Keep `--radius: 0.45rem` as-is
- [x] Add `framer-motion` dependency (`npm install framer-motion`)
- [x] Install additional shadcn components needed across the app:
  - [x] `npx shadcn add badge`
  - [x] `npx shadcn add card`
  - [x] `npx shadcn add separator`
  - [x] `npx shadcn add navigation-menu`
  - [x] `npx shadcn add sheet` (mobile nav)
- [x] Set `html` base font to Geist sans (update `layout.tsx` className — currently `font-mono`, change to `font-sans`)
- [x] Add `metadata` export to `layout.tsx` with title, description, OG tags for VayuBridge

### Exit Criteria — Phase 0

| Criterion | How to Verify |
|---|---|
| Theme renders white background, slate-900 text, no coral/red accents | `npm run dev` → visual check |
| All listed shadcn components import without TypeScript errors | `npm run typecheck` |
| Framer Motion installed and importable | Import `motion` from `framer-motion` in any file, no error |
| Body text uses Geist sans, monospace elements use JetBrains Mono | Browser dev tools → computed font |
| `metadata.title` shows in `<title>` tag | Browser tab shows "VayuBridge" |

---

## Phase 1 — Landing Page ✦

> The product's face. Asymmetric, premium, light. Every section maps to a specific conversion job.

### 1.1 — Navbar

- [x] Create `components/landing/navbar.tsx`
  - Logo mark left (text "VayuBridge" in Geist Mono, bold)
  - Nav links center: Features · Pricing · How It Works
  - Right: `Ghost` button "Sign In" + `Button` "Get Started Free"
  - Sticky on scroll with subtle backdrop blur + border-bottom on scroll
  - Mobile: shadcn `Sheet` drawer with full nav
- [x] Wire Navbar into `app/(landing)/layout.tsx` (create route group)

### 1.2 — Hero Section

> Job: Make the visitor feel understood in under 5 seconds. Lead with the wall, not the product.

- [x] Create `components/landing/hero.tsx`
  - **Layout:** Asymmetric — headline/CTA left-heavy (7 cols), floating UI mockup right (5 cols)
  - **Headline:** "You Built Something Great in Airtable. Don't Let a Limit Tear It Down."
    - Giant display type: `text-5xl` to `text-7xl`, Geist Mono variable font weight
    - Staggered word reveal using `framer-motion` (each word slides up with 0.05s stagger)
  - **Subheadline:** "VayuBridge removes Airtable's record caps, automation limits, and API restrictions — without touching your existing bases or workflows."
    - `text-lg text-muted-foreground`, fade in after headline
  - **CTA Block:**
    - Primary: `Button` size="lg" — "Connect Your Base Free →"
    - Microcopy line: "No credit card required · 90 seconds to connect · Your base is unchanged"
    - Use `Badge` variant="secondary" for "Free" label
  - **Right column — UI Mockup:**
    - Fake browser chrome card (shadcn `Card`) showing a mock query dashboard
    - "87,432 records" count with green dot indicator
    - Floating error toast (styled like Airtable's) fading in then crossing out
    - Subtle entrance animation: slide up + fade, 0.3s delay
  - **Background:** Very subtle grid dot pattern using CSS `radial-gradient` on background — no heavy visuals

### 1.3 — Pain Agitation Section ("Sound Familiar?")

> Job: Pattern interrupt. Show the visitor their own error messages. They stop scrolling.

- [x] Create `components/landing/pain-section.tsx`
  - **Layout:** Asymmetric — section title hard-left, error cards in a staggered grid right
  - **Section header:** "Sound Familiar?" — oversized, slightly rotated (-1.5deg), Geist Mono
  - **Error cards:** 4 cards styled as Airtable UI toasts/modals using shadcn `Card`
    - `❌ "Sorry, you've reached the maximum number of automations for this base."`
    - `❌ "This view is only showing the first 1,000 records."`
    - `❌ "You've exceeded the usage limits for this base."`
    - `❌ "Rate limit exceeded. Please wait before retrying."`
    - Each card: `border border-border bg-card`, subtle left red border accent, monospace font
    - Staggered scroll-triggered entrance (`framer-motion` `useInView`, each card 0.1s apart)
  - **Closing line** (full width): "We've seen these too. Every single one. That's exactly why we built VayuBridge."
    - Large, centered, italic, `text-muted-foreground`

### 1.4 — How It Works Section

> Job: Remove "but how does it actually work?" anxiety. Non-technical buyer must understand in 30 seconds.

- [x] Create `components/landing/how-it-works.tsx`
  - **Layout:** Full-width section, light `bg-muted/40` background to break page rhythm
  - **Section title:** "Up and Running in 3 Minutes" — left-aligned, display size
  - **Steps:** 3-column grid (desktop), stacked (mobile) — each step is a `Card`
    - Step 1 — Connect: Icon (link icon from lucide) · "Click 'Connect Airtable', authorise VayuBridge, pick your base. 90 seconds."
    - Step 2 — Sync: Icon (database icon) · "VayuBridge copies your data to a real database and keeps it perfectly up to date."
    - Step 3 — Use: Icon (sparkles icon) · "Your team opens Airtable and nothing looks different. Except the walls are gone."
  - **Step numbering:** Large muted number (01, 02, 03) behind card content — decorative, `text-8xl text-muted/30`
  - **Connector lines** between steps on desktop (CSS border-dashed)
  - Scroll-triggered entrance animation for each step card

### 1.5 — Pricing Section

> Job: Make Growth ($29) the obvious rational choice. Anchor against Airtable Enterprise.

- [x] Create `components/landing/pricing-section.tsx`
  - **Layout:** Asymmetric — section title + enterprise comparison line left, pricing cards right
  - **Section title:** "Simple Pricing. Zero Migration."
  - **Enterprise anchor line:** "Airtable Enterprise starts at $45/seat/month with a minimum seat requirement. VayuBridge Growth is $29 for your whole team. Do the math."
    - `text-sm text-muted-foreground`, `Separator` above/below
  - **Pricing cards:** 3 `Card` components — Free · Growth · Scale
    - Growth card: larger, subtle ring (`ring-2 ring-primary`), `Badge` "Most Popular"
    - Feature rows using `Separator` between groups
    - Row check icons: lucide `Check` (included) / `Minus` (not included, muted)
    - CTA per card: "Get Started Free" / "Start Growth Trial" / "Start Scale Trial"
  - **Usage add-on line** below cards: "Need more records? +100K synced records for $10/mo. No surprises."
  - Scroll-triggered entrance animation for the cards (scale up from 0.95 + fade)

### 1.6 — Footer

- [x] Create `components/landing/footer.tsx`
  - 2-column: logo + tagline left, links right (Privacy · Terms · Contact)
  - `Separator` top
  - "© 2026 VayuBridge. Built by a solo developer."

### 1.7 — Page Assembly

- [x] Create `app/(landing)/page.tsx` that imports and sequences all sections
- [x] Move boilerplate content out of `app/page.tsx` (repurpose as landing entry)
- [ ] Verify mobile responsiveness for all sections (375px, 768px, 1280px breakpoints)

### 1.8 — Extra: Waitlist & Email Collection *(added pre-launch)*

- [x] Create `components/waitlist-form.tsx` — reusable form with `source` + `variant` props (default / inverted)
- [x] Create `app/actions/waitlist.ts` — server action with email validation, Supabase insert, duplicate handling
- [x] Run `supabase/migrations/20260331_create_waitlist.sql` — `waitlist` table with RLS *(user must run in SQL Editor)*
- [x] Replace all hero/pricing CTAs with `WaitlistForm` components
- [x] Mark pricing cards "Coming Soon" (locked pill, no checkout links)
- [x] Add founding member FOMO section below pricing cards (dark inverted block, perks grid, pricing comparison)

### 1.9 — Extra: Blog Infrastructure *(added pre-launch)*

- [x] Create `content/blog/*.md` — 7 posts with YAML frontmatter (`title`, `slug`, `publishDate`, `published`, `noindex`, `metaDescription`, `targetKeyword`, `tag`)
- [x] Create `lib/posts.ts` — `getAllPosts()`, `getPost()`, `getLivePosts()`, `isPostLive()`, read time computation
- [x] Create `app/blog/[slug]/page.tsx` — server component, `notFound()` for unlive posts, `generateStaticParams`, `generateMetadata` with per-post SEO/noindex
- [x] Create `app/blog/layout.tsx`
- [x] Create `components/landing/blog-section.tsx` — live posts grid on landing page
- [x] Create `scripts/publish-scheduled-posts.js` — ES module script to flip `published`/`noindex` flags for due posts
- [x] Create `app/api/cron/publish-posts/route.ts` — Vercel cron route (protected by `CRON_SECRET`), fires deploy hook
- [x] Create `vercel.json` — cron schedule `0 9 * * 1` (Mondays 9am UTC)
- [x] Create `app/admin/blog-status/page.tsx` — read-only publish status dashboard

### 1.10 — Extra: SEO *(added pre-launch)*

- [x] Upgrade `app/layout.tsx` metadata — `metadataBase`, title template, keywords, robots, Twitter card, canonical
- [x] Add JSON-LD structured data (Organization, WebSite, SoftwareApplication) to layout
- [x] Add `aria-labelledby` + semantic heading hierarchy across all landing sections
- [x] Per-post `generateMetadata` with `noindex` robots for scheduled posts

### Exit Criteria — Phase 1

| Criterion | How to Verify |
|---|---|
| All 4 sections render without errors | `npm run dev`, no console errors |
| TypeScript passes with no errors | `npm run typecheck` |
| Staggered animations play on first scroll-into-view | Manual scroll test in browser |
| Navbar is sticky, backdrop blur activates on scroll | Scroll test |
| Pricing Growth card has visual emphasis over Free and Scale | Visual check |
| Page renders correctly at 375px (no horizontal overflow) | DevTools mobile emulator |
| Airtable error cards read like authentic Airtable UI (not generic) | Visual review |
| Hero headline visible above the fold on 1280px screen | Visual check |
| `npm run build` passes with zero errors | Build output |
| Lighthouse Performance score ≥ 85 on desktop | Lighthouse audit |

---

## Phase 2 — Authentication & Onboarding ✦

> Let users sign up, log in, and land on a protected dashboard shell.

### Tasks

- [x] Set up Supabase project, get `SUPABASE_URL` + `SUPABASE_PUBLISHABLE_DEFAULT_KEY`
- [x] Install `@supabase/supabase-js` and `@supabase/ssr`
- [x] Create Supabase client utilities (`utils/supabase/client.ts`, `utils/supabase/server.ts`, `utils/supabase/middleware.ts`)
- [x] Configure `middleware.ts` in project root for auth session refresh
- [x] Create `app/(auth)/login/page.tsx` — magic link email sign-in form
  - shadcn components: `Card`, `Input`, `Label`, `Button`
  - On submit: call `supabase.auth.signInWithOtp({ email })`
- [x] Create `app/(auth)/auth/callback/route.ts` — exchange code for session
- [x] Create `app/(auth)/auth/signout/route.ts` — POST handler to sign out
- [x] Create `app/(dashboard)/layout.tsx` — protected layout, redirects unauthenticated users
- [x] Create `app/(dashboard)/dashboard/page.tsx` — empty shell ("No bases connected yet")
  - shadcn: `Button` "Connect Airtable"

### Exit Criteria — Phase 2

| Criterion | How to Verify |
|---|---|
| Magic link email received after sign-in form submit | End-to-end test with real email |
| Clicking magic link creates authenticated session in Supabase | Check Supabase Auth dashboard |
| Unauthenticated request to `/dashboard` redirects to `/login` | Direct URL test |
| Authenticated user can reach `/dashboard` | Post-login navigation |
| `npm run build` passes | Build output |

---

## Phase 3 — Airtable OAuth & Base Connection ✦

> Users connect their Airtable workspace. The OAuth flow is the product's first impression.

### Tasks

- [ ] Create Airtable OAuth app at `airtable.com/create/oauth`
  - Scopes: `data.records:read`, `data.records:write`, `schema.bases:read`, `webhook:manage`
  - Redirect URI: `https://yourdomain.com/api/airtable/callback`
- [ ] Store `AIRTABLE_CLIENT_ID`, `AIRTABLE_CLIENT_SECRET` in `.env.local`
- [ ] Create `app/api/airtable/connect/route.ts` — generates OAuth authorization URL + PKCE code verifier, stores in Supabase session
- [ ] Create `app/api/airtable/callback/route.ts` — exchanges code for tokens, encrypts and stores in `connected_bases` table
- [ ] Run Supabase migration: create `connected_bases` table
  ```sql
  create table connected_bases (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users not null,
    airtable_base_id text not null,
    base_name text,
    access_token_enc text not null,
    refresh_token_enc text not null,
    webhook_id text,
    sync_status text default 'pending',
    last_synced_at timestamptz,
    created_at timestamptz default now()
  );
  alter table connected_bases enable row level security;
  create policy "users see own bases" on connected_bases for all using (auth.uid() = user_id);
  ```
- [ ] Create `app/api/airtable/bases/route.ts` — lists bases in connected workspace using stored token
- [ ] Build `components/dashboard/connect-airtable-button.tsx` — triggers OAuth flow
- [ ] Build `components/dashboard/base-selector.tsx` — lists bases post-auth, user picks which to sync
- [ ] Implement token refresh logic (call Airtable refresh endpoint before token expiry)

### Exit Criteria — Phase 3

| Criterion | How to Verify |
|---|---|
| "Connect Airtable" button redirects to Airtable OAuth consent screen | Manual test |
| After authorization, user returns to dashboard with base listed | Manual OAuth flow |
| Tokens stored encrypted in `connected_bases` (not plaintext) | Check Supabase table — values are opaque |
| User can disconnect a base (deletes tokens, stops sync) | Manual test |
| Token refresh runs automatically without user action | Check expiry logic in code |

---

## Phase 4 — Sync Engine ✦

> The core technical differentiator. Records move from Airtable to Supabase reliably.

### Tasks

- [ ] Install `@upstash/qstash` SDK
- [ ] Create `sync_log` Supabase table (migration)
- [ ] Create `app/api/sync/enqueue/route.ts` — receives `base_id`, enqueues initial sync job to QStash
- [ ] Create `app/api/sync/initial/route.ts` — the QStash-triggered worker
  - Fetch schema from Airtable → introspect field types → map to PostgreSQL types
  - Dynamic DDL: `CREATE TABLE IF NOT EXISTS airtable_{base_id}_{table_slug} (...)`
  - JSONB fallback for linked records, lookups, rollups
  - Paginate records (100/page) → bulk upsert to Supabase
  - Update `sync_log` with progress
  - On completion: register Airtable webhook, set `sync_status = 'active'`
- [ ] Create `app/api/webhooks/airtable/route.ts` — real-time change receiver
  - Verify HMAC-SHA256 signature
  - Handle `createdFieldsById` | `destroyedFieldIds` | `changedFieldsById`
  - Upsert / delete rows in dynamic tables
  - Log to `sync_log`
- [ ] Create fallback cron: `app/api/cron/poll-airtable/route.ts` — polls every 15 min if webhook is inactive
- [ ] Build `components/dashboard/sync-progress.tsx` — shows `X / Y records synced` live via Supabase realtime
- [ ] Apply Row Level Security to all `airtable_*` dynamic tables on creation

### Exit Criteria — Phase 4

| Criterion | How to Verify |
|---|---|
| Initial sync completes for a 10,000-record test base | Full sync test |
| Progress UI updates in real time during sync | Watch sync-progress component |
| Webhook receives and processes a record update within 30s | Edit record in Airtable, check Supabase within 30s |
| Webhook signature verification rejects invalid payloads | Send tampered payload to webhook endpoint |
| Fallback cron runs at 15-min intervals when webhook is down | Disable webhook, wait 15 min, check sync_log |
| Synced data is inaccessible to other users (RLS) | Query another user's table with different auth token |

---

## Phase 5 — Query Dashboard ✦

> The product's "aha moment." User sees 50,000 records load instantly. They feel the wall disappear.

### Tasks

- [ ] Install `@tanstack/react-table` for table virtualization
- [ ] Create `app/(dashboard)/dashboard/[baseId]/page.tsx`
- [ ] Build `components/dashboard/data-table.tsx`
  - Virtual scroll (render 100 rows, load more on scroll)
  - Full-text search via Supabase `tsvector` (or `ilike` for v1)
  - Column filters: equals, contains, gt/lt, is empty
  - Multi-column sort
  - Column visibility toggle (`DropdownMenu` from shadcn)
  - shadcn components: `Table`, `Input`, `Select`, `DropdownMenu`, `Button`, `Badge`
- [ ] Build CSV export (streaming query, trigger download)
- [ ] Build Excel export (`xlsx` library, client-side)
- [ ] Build `components/dashboard/table-stats-bar.tsx` — shows record count, filter status, last synced time

### Exit Criteria — Phase 5

| Criterion | How to Verify |
|---|---|
| 50,000 records load and scroll smoothly (no freeze) | Performance test with large dataset |
| Search returns correct results across all text fields | Manual search test |
| CSV export contains all records (not just visible 100) | Export and count rows |
| Column filter combinations work correctly | Combine 2+ filters, verify results |
| Dashboard is responsive on mobile (horizontal scroll for wide tables) | Mobile emulator |

---

## Phase 6 — Automation Overflow Builder ✦

> Users bypass Airtable's 50-automation cap. VayuBridge executes rules on its own infra.

### Tasks

- [ ] Create `automations` + `automation_runs` Supabase tables (migration)
- [ ] Build `app/(dashboard)/dashboard/automations/page.tsx`
- [ ] Build `components/dashboard/automation-builder.tsx`
  - Step 1: Trigger — "When [table] [field] changes to [value]"
  - Step 2: Action — HTTP POST / Send Email (Resend) / Update Airtable Record
  - shadcn components: `Select`, `Input`, `Card`, `Button`, `Switch`
- [ ] Implement automation execution in `app/api/webhooks/airtable/route.ts`
  - On each webhook event, query matching automation rules, execute actions
  - Log each run to `automation_runs`
- [ ] Install `resend` SDK for email actions
- [ ] Build `components/dashboard/automation-run-log.tsx` — last 50 runs, status, timestamp

### Exit Criteria — Phase 6

| Criterion | How to Verify |
|---|---|
| Automation rule builder saves to Supabase without errors | Create rule, check DB |
| Rule fires within 30s of triggering Airtable event | End-to-end test: change field, verify action executed |
| HTTP POST action delivers payload to test endpoint | Use webhook.site as target |
| Email action sends via Resend | Create email rule, trigger it, check inbox |
| Execution log shows correct status and timestamp | Check run log UI |
| Disabled rules do not fire | Toggle rule off, trigger event, verify no execution |

---

## Phase 7 — Payments & Plan Enforcement ✦

> Monetise. Gate features by plan. Handle subscriptions without ops overhead.

### Tasks

- [ ] Create Dodopayments account, set up 3 products: Growth ($29/mo), Scale ($79/mo)
- [ ] Install Dodopayments Node.js SDK
- [ ] Store `DODO_API_KEY`, `DODO_WEBHOOK_SECRET` in env
- [ ] Create `app/(landing)/pricing/page.tsx` (or reuse landing pricing section with direct checkout links)
- [ ] Create `app/api/payments/checkout/route.ts` — creates Dodopayments checkout session
- [ ] Create `app/api/webhooks/dodopayments/route.ts` — handles subscription events
  - `subscription.created` → update `users.plan_tier`
  - `subscription.cancelled` → downgrade to Free
  - `subscription.renewed` → refresh plan expiry
- [ ] Add `plan_tier` column to `users` Supabase table
- [ ] Implement plan enforcement middleware
  - Record limit check before sync start
  - Automation count check before rule creation
  - Feature gate on CSV export (Growth+ only)
- [ ] Build `components/dashboard/usage-bar.tsx` — shows % of plan limits used
- [ ] Add upgrade prompt at 80% limit usage (shadcn `Alert` or `Dialog`)

### Exit Criteria — Phase 7

| Criterion | How to Verify |
|---|---|
| Growth checkout redirects to Dodopayments, processes payment | Test with Dodopayments sandbox |
| `subscription.created` webhook upgrades user's plan in DB | Webhook test |
| Cancellation downgrades user to Free tier | Simulate cancellation event |
| Free user blocked from syncing >5,000 records | Attempt sync with 6,000-record base on Free plan |
| Usage bar shows correct percentage | Compare displayed % to actual record count |
| Upgrade prompt appears at 80% usage | Fill base to 80% of plan limit |

---

## Phase 8 — Polish, Onboarding & Launch ✦

> The gap between "technically working" and "actually ships" lives here.

### Tasks

- [ ] Build onboarding wizard for first-time users (3 steps: connect → sync → explore)
  - shadcn components: `Dialog` or dedicated onboarding page, `Progress`, `Button`
- [ ] Add error monitoring: configure Vercel error logs + Supabase log alerts
- [ ] Write `robots.txt` and `sitemap.xml`
- [x] SEO: add structured data (JSON-LD) for the landing page
- [ ] End-to-end smoke test: sign up → connect Airtable → sync 1K records → view in dashboard → create automation → upgrade plan
- [ ] Load test: simulate 10 concurrent initial syncs
- [ ] Test with 3 real beta users (from Airtable Community pre-launch outreach)
- [x] Deploy to production on Vercel
- [ ] Configure custom domain on Vercel *(user action required)*
- [ ] Set up Dodopayments live mode

### Exit Criteria — Phase 8

| Criterion | How to Verify |
|---|---|
| Full end-to-end flow works without manual intervention | QA run with fresh account |
| 3 beta users complete onboarding without asking for help | Beta user session observation |
| No P0 or P1 bugs open | Bug tracker clear |
| Vercel build passes on `main` branch | CI check |
| Production domain loads with SSL | Browser padlock check |
| Dodopayments live mode processes a real $29 transaction | Live payment test |

---

## Appendix: shadcn Components Reference

| Component | Phase Used | Install Command |
|---|---|---|
| `button` | All | Already installed |
| `badge` | 0, 1 | `npx shadcn add badge` |
| `card` | 1, 2, 5, 6 | `npx shadcn add card` |
| `separator` | 1, 7 | `npx shadcn add separator` |
| `navigation-menu` | 1 | `npx shadcn add navigation-menu` |
| `sheet` | 1 (mobile nav) | `npx shadcn add sheet` |
| `input` | 2, 5, 6 | `npx shadcn add input` |
| `label` | 2, 6 | `npx shadcn add label` |
| `table` | 5 | `npx shadcn add table` |
| `select` | 5, 6 | `npx shadcn add select` |
| `dropdown-menu` | 5 | `npx shadcn add dropdown-menu` |
| `switch` | 6 | `npx shadcn add switch` |
| `alert` | 7 | `npx shadcn add alert` |
| `dialog` | 7, 8 | `npx shadcn add dialog` |
| `progress` | 4, 8 | `npx shadcn add progress` |

---

## Appendix: Environment Variables Checklist

| Variable | Phase | Source |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | 2 | Supabase project settings — ✅ set in `.env.local` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | 2 | Supabase project settings — ✅ set in `.env.local` *(replaces ANON_KEY)* |
| `SUPABASE_SERVICE_ROLE_KEY` | 4 | Supabase project settings (server-only) |
| `AIRTABLE_CLIENT_ID` | 3 | Airtable OAuth app |
| `AIRTABLE_CLIENT_SECRET` | 3 | Airtable OAuth app |
| `AIRTABLE_REDIRECT_URI` | 3 | Your domain + `/api/airtable/callback` |
| `TOKEN_ENCRYPTION_KEY` | 3 | 32-byte random secret (AES-256) |
| `QSTASH_URL` | 4 | Upstash QStash console |
| `QSTASH_TOKEN` | 4 | Upstash QStash console |
| `QSTASH_CURRENT_SIGNING_KEY` | 4 | Upstash QStash console |
| `RESEND_API_KEY` | 6 | Resend dashboard |
| `DODO_API_KEY` | 7 | Dodopayments dashboard |
| `DODO_WEBHOOK_SECRET` | 7 | Dodopayments dashboard |

---

*VayuBridge Implementation Tracker v1.0 — March 2026*
