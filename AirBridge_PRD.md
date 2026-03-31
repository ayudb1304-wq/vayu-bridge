# AirBridge — Product Requirements Document

> **Break Free from Airtable Limits. Keep Everything You Love.**

| Field | Value |
|---|---|
| Version | 1.0 |
| Status | Draft |
| Date | March 2026 |
| Author | Solo Founder |

A middleware SaaS that syncs Airtable data to a real PostgreSQL database and extends automations beyond Airtable's hard limits — so users keep their familiar Airtable interface while eliminating every wall that blocks them.

**Target:** Airtable power users, no-code SMB teams, operations managers
**Build Time:** 14 days (solo dev) | **Infra:** ~$65–100/month | **Stack:** Next.js + Supabase + Dodopayments

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Target Users & Personas](#3-target-users--personas)
4. [Product Goals & Success Metrics](#4-product-goals--success-metrics)
5. [Feature Specifications](#5-feature-specifications)
6. [Technical Architecture](#6-technical-architecture)
7. [Two-Week Build Plan](#7-two-week-build-plan)
8. [User Stories & Acceptance Criteria](#8-user-stories--acceptance-criteria)
9. [Out of Scope (Non-Goals)](#9-out-of-scope-non-goals-for-mvp)
10. [Risks & Mitigations](#10-risks--mitigations)
11. [Acquisition Strategy](#11-acquisition-strategy)
12. [Launch Marketing Plan](#12-launch-marketing-plan)
13. [Appendix: Source References](#13-appendix-source-references)

---

## 1. Executive Summary

> 💡 **The One-Line Pitch:** AirBridge is a middleware SaaS that syncs Airtable data to a real PostgreSQL database and extends automations beyond Airtable's hard limits — so users keep their familiar Airtable interface while eliminating every wall that blocks them.

Airtable has 450,000+ organizational customers. A meaningful percentage of them — power users, operations teams, and SMB owners building production workflows — regularly hit three hard limits that Airtable does not plan to remove on lower pricing tiers: a 50,000-record cap per base, a 50-automation cap per base, and a 1,000 API calls/month cap on free plans.

When these limits are hit, users are forced to choose between paying Airtable's enterprise tier (often 10x more expensive), migrating to a full database solution (weeks of work), or patching together brittle Zapier workarounds that cost $50–200/month on top of their existing Airtable plan.

AirBridge offers a fourth option: **stay in Airtable, pay $29–79/month, and remove the limits entirely.** The product is buildable by one developer in two weeks on a serverless Node.js/Next.js stack using Supabase, Vercel, and Dodopayments.

| Problem Severity | Market Size | Build Timeline | Target MRR (12mo) |
|---|---|---|---|
| 🔴 HIGH | 450K+ Orgs | 14 Days | $4,500+ |

---

## 2. Problem Statement

### 2.1 The Three Hard Walls

The following limitations are documented in Airtable's official support pages and confirmed by recurring community complaints across Airtable Community forums, Reddit's r/Airtable, and r/nocode:

| Limit | Threshold | User Impact | Forum Evidence |
|---|---|---|---|
| Record Cap | 50,000 records/base | Sales pipelines, inventory systems, and analytics bases hit this wall as businesses scale | r/Airtable: *"Blocked by 50K record cap on data-heavy project"* |
| Automation Cap | 50 automations/base | Even Enterprise plan users hit this; 50 is insufficient for complex operational workflows | Airtable Community: *"I have reached the maximum number of automations — this is insufficient"* |
| Field Cap | 500 fields/table | Complex project management templates and CRM setups consistently exceed this | Airtable Community: *"That's SILLY this 500 fields limit. It will take me weeks to fix this"* |
| API Rate Limit | 5 req/sec, 1K calls/mo (free) | API-connected apps choke; developers can't build reliable integrations | GapConsulting: 2024 API pricing changes cut free tier to 1,000 calls/month |
| Record Loading | 1,000 visible at a time | Sales teams using quick search/filter lose visibility into full datasets | Airtable Community: *"The 1,000-record limit is causing us to lose sales"* |

### 2.2 Current Workarounds and Why They Fail

- **Multiple bases:** Users split data across 2–5 bases to stay under record caps. This breaks linked records, automations, and reporting.
- **Zapier overflow:** Adding Zapier to bypass the 50-automation limit costs $50–200/month extra, introduces latency, and creates a fragile dependency chain.
- **Full migration:** Moving to Supabase, Notion, or a custom database requires weeks of developer time and training — a non-starter for non-technical teams.
- **Airtable Enterprise:** Starts at ~$45/seat/month with a minimum seat requirement — easily 10x the cost for small teams hitting basic limits.

> 📌 **The Gap AirBridge Fills:** Users don't want to leave Airtable. They love the interface, their existing bases, and their workflows. AirBridge is the only tool that extends Airtable without replacing it — acting as an invisible layer underneath that removes limits while preserving the familiar front-end experience.

---

## 3. Target Users & Personas

### 3.1 Primary Personas

| Persona | Profile | Primary Pain | Willingness to Pay |
|---|---|---|---|
| The Ops Manager | Non-technical, manages team workflows in Airtable. 30–45 years old, SMB operations or project management role. | Hit the 50-automation cap; manually doing work that should be automated. | $29–49/mo |
| The No-Code Builder | Technical-adjacent freelancer or consultant who builds Airtable bases for clients. Builds 3–10 bases per client. | Client data exceeds record limits; can't reliably connect Airtable to external systems for clients. | $49–79/mo (Agency plan) |
| The Power User Developer | Developer using Airtable as a lightweight backend or internal tool. Comfortable with APIs. | 5 req/sec rate limit and 1K calls/month blocks reliable integrations; wants a real database underneath. | $29–49/mo |
| The SMB Owner | Runs a small business (e-commerce, agency, services). Uses Airtable for CRM, inventory, or project tracking. | Record cap blocking growth; doesn't want to hire a developer to migrate to a "real" database. | $19–29/mo |

### 3.2 Who AirBridge Is NOT For

- Large enterprises already on Airtable's Business or Enterprise tier (they have relaxed limits)
- Teams willing to fully migrate to Supabase, Notion, or a custom database stack
- Airtable users who only use basic features and never approach any limits

---

## 4. Product Goals & Success Metrics

### 4.1 MVP Goals (Week 1–2 Launch)

1. Connect a user's Airtable base to AirBridge via OAuth in under 2 minutes
2. Perform an initial full sync of all records from Airtable to PostgreSQL (Supabase)
3. Maintain real-time sync via Airtable webhooks (changes reflected in <30 seconds)
4. Provide a query dashboard where users can search and filter the full dataset without record-display limits
5. Enable export of full dataset to CSV/Excel
6. Accept subscription payments via Dodopayments

### 4.2 Post-MVP Goals (Month 2–3)

1. Automation overflow builder: create additional automations that trigger on Airtable field changes
2. Bidirectional sync: allow users to edit records in AirBridge dashboard and push changes back to Airtable
3. API access: expose a REST API for each synced base, bypassing Airtable's rate limits
4. White-label / agency mode: manage multiple client bases from one account

### 4.3 Success Metrics

| Metric | Definition | Month 3 Target | Month 12 Target |
|---|---|---|---|
| MRR | Monthly Recurring Revenue | $500 | $4,500 |
| Paying Customers | Active subscribers | 20 | 150 |
| Time to First Sync | OAuth → first sync complete | < 3 minutes | < 2 minutes |
| Sync Reliability | Successful webhook deliveries | > 95% | > 99% |
| Churn Rate | Monthly subscriber churn | < 15% | < 8% |
| Activation Rate | Signups who complete first sync | > 60% | > 75% |

---

## 5. Feature Specifications

### 5.1 Airtable Connection & OAuth

**Description:** Users connect their Airtable workspace via Airtable's official OAuth 2.0 flow. AirBridge stores OAuth access tokens and refresh tokens encrypted in Supabase. Users can connect multiple bases from the same or different workspaces.

**Acceptance Criteria:**
- User clicks 'Connect Airtable' and is redirected to Airtable's OAuth consent screen
- After authorization, AirBridge receives and securely stores the access token and refresh token
- User sees a list of all bases and tables in their connected workspace
- Token refresh is handled automatically before expiry — no user action required
- User can disconnect a base at any time, which stops sync and deletes stored tokens

> ⚠️ **Technical Note:** Airtable OAuth scopes required: `data.records:read`, `data.records:write`, `schema.bases:read`, `webhook:manage`. Webhooks require a minimum Team plan on the user's Airtable account. Document this limitation clearly in onboarding.

---

### 5.2 Initial Full Sync

**Description:** When a user first connects a base, AirBridge performs a paginated full sync of all records from all selected tables to Supabase PostgreSQL. The sync is non-blocking — users see a progress indicator and can navigate away.

**Acceptance Criteria:**
- Sync pulls records in batches of 100 (Airtable API max page size)
- Schema is auto-created in Supabase based on Airtable field definitions
- Progress is shown as a percentage: *"Syncing table X: 2,340 / 48,000 records"*
- Sync completes without errors for bases up to 100,000 records
- Sync respects Airtable's 5 req/sec rate limit — includes automatic retry with exponential backoff
- On completion, user receives an in-app notification and email confirmation

---

### 5.3 Real-Time Sync via Webhooks

**Description:** After the initial sync, AirBridge registers Airtable webhooks to receive real-time change notifications. When records are created, updated, or deleted in Airtable, the changes are reflected in the Supabase database within 30 seconds.

**Acceptance Criteria:**
- Webhook is registered automatically after initial sync — no user configuration needed
- Create, update, and delete events are handled correctly
- Webhook endpoint processes payloads within 500ms
- If a webhook delivery fails, AirBridge falls back to a periodic poll every 15 minutes
- Webhook health status is visible in the user's dashboard (*"Active / Last received: 2 min ago"*)

---

### 5.4 Query Dashboard (Unlimited Records)

**Description:** The core user-facing feature. A web-based data browser that shows all synced records without any display limits. Users can search, filter, sort, and export — exactly like Airtable's interface but without the 1,000-record loading cap.

**Acceptance Criteria:**
- All records from all synced tables are displayed, regardless of count
- Full-text search across all text fields
- Column filters: equals, contains, greater than, less than, is empty
- Multi-column sort
- Pagination or virtual scrolling for performance (render 100 rows at a time, load more on scroll)
- Export to CSV and Excel (.xlsx) for the full dataset or filtered view
- Column visibility toggle to hide/show fields

---

### 5.5 Automation Overflow Builder

**Description:** A visual rule builder that lets users create additional automations that run on AirBridge's infrastructure, bypassing Airtable's 50-automation limit. Rules trigger on Airtable field changes (detected via webhook) and can execute: send email, send webhook to external URL, update another Airtable record, or send a Slack message.

**Acceptance Criteria:**
- Rule builder UI: *"When [table] [field] changes to [value], then [action]"*
- Supported triggers: field value changes, new record created, record deleted
- Supported actions: HTTP POST to webhook URL, send email via Resend, update record in same or different Airtable table
- Rules execute within 30 seconds of the triggering event
- Each rule has an execution log showing last 50 runs with status and timestamp
- No hard limit on number of rules (soft limit based on plan tier)

---

### 5.6 Pricing & Subscription Management

| Feature | Free | Growth ($29/mo) | Scale ($79/mo) |
|---|---|---|---|
| Connected Bases | 1 | 3 | Unlimited |
| Synced Records | 5,000 | 50,000 | 500,000 |
| Overflow Automations | 3 | 25 | Unlimited |
| CSV/Excel Export | No | Yes | Yes |
| API Access | No | Yes | Yes |
| Team Seats | 1 | 1 | 3 |
| Sync Frequency | Every 15 min | Real-time | Real-time |
| Support | Community | Email (48h) | Email (24h) |

Payments are processed via **Dodopayments**, which acts as Merchant of Record — handling VAT/GST collection in 150+ countries and enabling global subscriptions without requiring the founder to register as a tax entity in multiple jurisdictions. Usage add-on: $10 per additional 100,000 synced records/month.

---

## 6. Technical Architecture

### 6.1 Stack Overview

| Layer | Technology | Rationale | Monthly Cost |
|---|---|---|---|
| Frontend + API | Next.js 14 (App Router) on Vercel Pro | Full-stack React, serverless API routes, global CDN, zero ops | $20 |
| Database | Supabase Pro (PostgreSQL) | Managed Postgres, Row Level Security, real-time subscriptions, Edge Functions | $25 |
| Auth | Supabase Auth | Magic links, OAuth (Google), session management — built-in with Supabase | Included |
| Sync Engine | Vercel Serverless Functions + Cron | Long-running sync jobs as serverless functions; scheduled cron for fallback polling | Included |
| Airtable Integration | Official Airtable JS SDK + Webhooks | Official rate-limit handling, retry logic, schema introspection | Free |
| Email | Resend SDK | Transactional email — 3,000 free/month; welcome emails, overdue notices, sync alerts | $0–20 |
| Payments | Dodopayments Node.js SDK | Merchant of Record, 220+ countries, subscription billing, zero setup fee | 4% + $0.40/txn |
| Queue/Async | Upstash QStash | Async job queue for large initial syncs; prevents timeout on Vercel's 10s function limit | $0 (free tier) |
| Monitoring | Vercel Analytics + Supabase Logs | Built-in observability without additional tooling | Included |

### 6.2 Data Architecture

**Core Supabase Tables:**

| Table | Key Fields | Purpose |
|---|---|---|
| `users` | id, email, plan_tier, stripe_customer_id, created_at | AirBridge user accounts |
| `connected_bases` | id, user_id, airtable_base_id, base_name, access_token_enc, refresh_token_enc, webhook_id, sync_status, last_synced_at | Each connected Airtable base |
| `sync_log` | id, base_id, table_name, records_synced, status, error_message, started_at, completed_at | Audit trail for all sync operations |
| `automations` | id, user_id, base_id, trigger_table, trigger_field, trigger_value, action_type, action_config, is_active, last_run_at | Overflow automation rules |
| `automation_runs` | id, automation_id, status, triggered_at, completed_at, error | Execution log for automations |

Synced Airtable data lives in dynamically-created tables following the naming convention: `airtable_{base_id}_{table_name_slug}`. Schema is auto-created from Airtable's field metadata using PostgreSQL dynamic DDL. Row Level Security policies ensure users can only query their own synced tables.

### 6.3 Sync Engine Design

**Initial Sync Flow:**
1. User connects base → OAuth callback stores tokens
2. Enqueue initial sync job to Upstash QStash (avoids Vercel 10s timeout)
3. QStash triggers `/api/sync/initial` endpoint with `base_id`
4. Fetch schema from Airtable → create dynamic tables in Supabase
5. Paginate through all records (100/page) → bulk upsert to Supabase
6. Register Airtable webhook for ongoing real-time sync
7. Mark `sync_status = 'active'` → notify user

**Real-Time Sync Flow:**
1. Airtable sends webhook payload to `/api/webhooks/airtable`
2. Endpoint verifies webhook signature (HMAC-SHA256)
3. Parse change type: `createdFieldsById` | `destroyedFieldIds` | `changedFieldsById`
4. Upsert / delete corresponding rows in Supabase
5. Log to `sync_log` table

### 6.4 Infrastructure Cost Breakdown

| Service | Plan | Monthly Cost | Notes |
|---|---|---|---|
| Vercel | Pro | $20 | Includes 100GB bandwidth, 1TB Function executions, Cron Jobs |
| Supabase | Pro | $25 | 8GB database, 250GB storage, daily backups, Edge Functions |
| Resend | Free → Starter | $0–20 | 3K emails free; $20 for 50K emails/month |
| Upstash QStash | Free | $0 | 500 messages/day free; sufficient for ~500 users |
| Dodopayments | Per-transaction | 4% + $0.40/txn | No monthly fee; reduces to 3.5% at higher volume |
| Domain + SSL | Namecheap/Cloudflare | $2 | Domain registration + free SSL via Vercel |
| **Total (pre-revenue)** | | **~$67–87/mo** | Well within the $200 budget constraint |

---

## 7. Two-Week Build Plan

> This timeline assumes one solo developer working 6–8 hours/day. Tasks are sequenced to deliver a working demo at the end of Week 1 and a shippable MVP at the end of Week 2.

### Week 1: Core Sync Engine

| Days | Focus | Tasks |
|---|---|---|
| Day 1–2 | Foundation | Initialize Next.js 14 (App Router) project on Vercel; Configure Supabase (auth, RLS, initial schema); Set up Supabase Auth with magic link + Google OAuth; Create protected dashboard shell |
| Day 3–4 | Airtable OAuth | Implement Airtable OAuth 2.0 flow (authorization URL, callback, token exchange); Store encrypted tokens in `connected_bases`; Build 'Connect Airtable' UI with base/table selector; Test with real Airtable workspace |
| Day 5–6 | Full Sync Engine | Build schema introspection (Airtable field types → PostgreSQL types); Implement dynamic table creation in Supabase; Build paginated record sync (100/page → bulk upsert); Integrate Upstash QStash for async jobs; Add sync progress UI |
| Day 7 | Webhooks + Buffer | Register Airtable webhook after initial sync; Build webhook receiver with HMAC verification; Add fallback polling cron (every 15 minutes); **Demo milestone:** connect a base, sync 10K records, view in Supabase |

### Week 2: User Interface + Payments

| Days | Focus | Tasks |
|---|---|---|
| Day 8–9 | Query Dashboard | Build data browser with virtual scrolling; Full-text search via Supabase `tsvector`; Column filters (equals, contains, gt/lt, is empty); Multi-column sort, column visibility toggle; CSV export via Supabase streaming query |
| Day 10–11 | Automation Builder | Build automation rule UI ("When [field] changes → do [action]"); Implement triggers from webhook handler; Implement actions (HTTP POST, Resend email, Airtable record update); Add execution log view (last 50 runs per rule) |
| Day 12–13 | Payments + Plans | Integrate Dodopayments SDK (create products: Free, Growth, Scale); Build `/pricing` page with checkout links; Implement plan enforcement in API middleware; Add usage metering (synced records count, usage bars); Handle Dodopayments webhook events (subscription created/cancelled) |
| Day 14 | Polish + Launch | Build onboarding wizard for first-time users; Write landing page using r/Airtable complaints as proof points; Configure error monitoring (Vercel + Supabase logs); Deploy to production, test end-to-end with 3 beta users; Post to Hacker News, r/Airtable, r/nocode, Airtable Community forums |

---

## 8. User Stories & Acceptance Criteria

### US-001 — Connect Airtable Base

> As an Airtable user who has hit record limits, I want to connect my base to AirBridge in under 3 minutes so that I can immediately access my full dataset without Airtable's display restrictions.

- **Given** I'm on the AirBridge dashboard, **when** I click 'Connect Airtable', **then** I am redirected to Airtable's OAuth consent screen
- **Given** I authorize AirBridge, **when** I return to the dashboard, **then** I see my workspace's bases listed within 5 seconds
- **Given** I select a base, **when** I click 'Start Sync', **then** AirBridge begins syncing and shows real-time progress

### US-002 — Query Full Dataset

> As an operations manager who manages a 45,000-record inventory base, I want to search and filter all my records at once so I can find products without Airtable's 1,000-record loading cap blocking me.

- **Given** my base is synced, **when** I open the query dashboard, **then** all 45,000 records are browsable without pagination errors
- **Given** I type a search term, **when** results load, **then** they cover all matching records across the full dataset
- **Given** I apply a filter, **when** I click export, **then** the resulting CSV contains all filtered records (not just the visible 1,000)

### US-003 — Create Overflow Automation

> As a no-code builder who has maxed out Airtable's 50 automations, I want to create additional rules in AirBridge so my client's workflow continues to operate correctly.

- **Given** I'm on the automations page, **when** I click 'New Rule', **then** I see a 3-step builder: trigger, condition, action
- **Given** I set a trigger on 'Status field changes to Done', **when** a record is updated in Airtable, **then** AirBridge fires the action within 30 seconds
- **Given** my automation fires, **then** I can see it logged in execution history with status, timestamp, and any error details

---

## 9. Out of Scope (Non-Goals) for MVP

- Full Airtable replacement or migration tool — AirBridge is a complement, not a competitor
- Custom views (gallery, calendar, kanban) — the query dashboard is grid/table only in v1
- Mobile app — web-first only
- Native Airtable extension or block — AirBridge runs as a standalone web app
- Support for Airtable's attachment/file field content in the synced database — only metadata is synced
- AI-powered data analysis — potential v2 feature
- Multi-tenant white-label (custom domain per client) — considered for v3

---

## 10. Risks & Mitigations

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Airtable changes OAuth scope or webhook API | Low | High | Monitor Airtable developer changelog; abstract integration layer so changes require only one module update; maintain fallback polling |
| Vercel function timeout on large initial syncs | Medium | Medium | Use Upstash QStash for async processing; break initial sync into chunks of 1,000 records per invocation |
| Supabase schema conflicts for non-standard Airtable field types | Medium | Low | Map all Airtable field types to safe PostgreSQL types; use JSONB for complex types (linked records, lookup fields) |
| Dodopayments not available in user's country | Low | Medium | Dodopayments covers 220+ countries; edge cases handled with Razorpay as fallback for Indian domestic customers |
| Airtable blocks 3rd-party integrations (policy change) | Very Low | Very High | AirBridge uses Airtable's official API and OAuth — fully sanctioned access. Risk is existential but extremely unlikely given Airtable's open API strategy |
| Low free-to-paid conversion | Medium | High | Free tier is deliberately restrictive (1 base, 5K records) to push power users to Growth plan; add in-app upgrade prompts triggered at 80% limit usage |

---

## 11. Acquisition Strategy

AirBridge is positioned for acquisition from the outset. The product sits in the ecosystem of three categories of potential strategic acquirers:

| Acquirer Type | Examples | Strategic Reason | Likely Acquisition Stage |
|---|---|---|---|
| No-code platforms | Airtable itself, Notion, Coda | AirBridge users are Airtable power users — the most engaged segment. Acquiring AirBridge means acquiring a proven middleware layer and a customer list of high-value users already pushing limits | $3K–10K MRR |
| Automation platforms | Zapier, Make (Integromat) | AirBridge's automation overflow module competes with how users currently use Zapier to work around Airtable limits. Acquiring AirBridge deepens their Airtable integration story | $5K–20K MRR |
| Database/BaaS platforms | Supabase, PlanetScale, Neon | AirBridge proves there is demand for a no-code-friendly SQL layer on top of Airtable workflows. The product validates a market segment they can serve at scale | $3K–15K MRR |

> 🎯 **Acquisition Preparation Checklist:**
> - Document MRR, churn, and activation rate from day 1 — use Dodopayments dashboards as source of truth
> - List on Acquire.com and MicroAcquire at $2K+ MRR
> - Publish monthly revenue updates on Indie Hackers — simultaneously marketing and acquisition signal
> - Keep the codebase clean and well-commented: acquirers always do a code review

---

## 12. Launch Marketing Plan

> The strategy is engineered for a developer who is not a marketer. Every channel maps to a task a developer is comfortable doing: answering technical questions, posting demos, and writing one well-researched article.

| Phase | Timeline | Channel | Action | Expected Outcome |
|---|---|---|---|---|
| Pre-launch | Week 2 | Airtable Community | Find 10 threads with automation/record limit complaints. Reply helpfully and mention: *"I'm building something for this — want early access?"* | 20–50 email signups |
| Launch Day | Day 14 | Hacker News | Post *"Show HN: I built a tool that removes Airtable's record and automation limits"* with a 2-minute Loom demo | 200–500 visitors, 5–15 signups |
| Launch Day | Day 14 | Reddit | Post to r/Airtable, r/nocode, r/SaaS, r/Entrepreneur with demo and free tier offer | 100–300 visitors |
| Week 3 | Post-launch | SEO Article | Publish: *"Airtable 50,000 record limit: what it is and how to work around it"* — targeting exact search terms people use when they hit the wall | Organic traffic in 30–60 days |
| Month 2 | Ongoing | Airtable Consultants | Find 10 Airtable consultants on Upwork/LinkedIn. Offer free Agency plan in exchange for referring clients who hit limits | 5–10 warm B2B leads/month |
| Month 3+ | Ongoing | Indie Hackers | Post monthly revenue updates | Community following + acquirer attention |

---

## 13. Appendix: Source References

### Community Threads That Validated This Problem

- **Airtable Community** — *"automation maximum hit!"* — enterprise user hitting 50-automation cap: *"A maximum of 50 automations on an enterprise scale plan is insufficient"*
  `community.airtable.com/enterprise-network-76/automation-maximum-hit-46901`

- **Airtable Community** — *"Sorry, you've exceeded the usage limits for this base — 500 fields maxed out"* — user quote: *"It will take me weeks to fix this"*
  `community.airtable.com/base-design-9/sorry-you-ve-exceeded-the-usage-limits-for-this-base-airtable-500-fields-maxed-out-30024`

- **Airtable Community** — *"Losing on sales. Shows only 1,000 records instead of all records"* — user reporting direct revenue impact from the 1,000-record display limit
  `community.airtable.com/other-questions-13/losing-on-sales-shows-only-1-000-records-instead-of-all-records-47289`

- **Reddit r/Airtable** — software engineer describing being blocked by 50,000-record cap on a data-heavy project

- **GapConsulting.io** — documented Airtable's 2024 API pricing changes cutting free tier to 1,000 API calls/month
  `gapconsulting.io/blog/new-changes-to-airtable-s-api-pricing`

- **NocoBase Blog** — *"Airtable Data Limit Reached: 3 Common Solutions"* — confirms workaround culture and user frustration across multiple limit types
  `nocobase.com/en/blog/airtable-data-limit-reached-3-common-solutions`

### Key Technology Documentation

- Airtable API: https://airtable.com/developers/web/api/introduction
- Airtable OAuth 2.0: https://airtable.com/developers/web/api/oauth-reference
- Airtable Webhooks: https://airtable.com/developers/web/api/webhooks-overview
- Supabase Docs: https://supabase.com/docs
- Dodopayments Docs: https://docs.dodopayments.com
- Next.js App Router: https://nextjs.org/docs/app
- Upstash QStash: https://upstash.com/docs/qstash

---

*AirBridge PRD v1.0 — March 2026 — Confidential*
