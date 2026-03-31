---
title: "How VayuBridge Works: A Technical Deep-Dive"
slug: "how-airbridge-works"
publishDate: "2026-05-12"
published: false
noindex: true
metaDescription: "A technical deep-dive into how VayuBridge syncs Airtable data to PostgreSQL, handles real-time updates via webhooks, and removes Airtable's hard limits without changing your workflow."
targetKeyword: "airtable sync postgresql middleware"
tag: "Technical"
---

# How VayuBridge Works: A Technical Deep-Dive

If you're evaluating VayuBridge as a solution for Airtable's limits, this post is for the developers and technically-minded users who want to understand what's actually happening under the hood — not just the marketing version.

We'll cover the full architecture: how the OAuth connection works, how the initial sync handles large datasets, how webhooks power real-time updates, how the overflow automations are triggered, and what the data model looks like in PostgreSQL.

---

## The Core Architecture

VayuBridge sits between your Airtable workspace and a PostgreSQL database (hosted on Supabase). The relationship looks like this:

```
Your Team
    │
    ▼
Airtable (your interface — unchanged)
    │  │
    │  └── Webhooks (change events) ──────────┐
    │                                          │
    └── API (initial sync + writes back) ──┐  │
                                           │  │
                                           ▼  ▼
                                      VayuBridge
                                      (sync engine)
                                           │
                                           ▼
                                    PostgreSQL (Supabase)
                                    (your complete dataset)
                                           │
                                           ▼
                               VayuBridge Query Dashboard
                               + Overflow Automations
                               + REST API (rate-limit-free)
```

Airtable remains the source of truth. VayuBridge never modifies your Airtable data without an explicit instruction — the sync is primarily one-directional (Airtable → PostgreSQL), with optional write-back for automation actions.

---

## Step 1: OAuth Connection

VayuBridge connects to your Airtable workspace via Airtable's official OAuth 2.0 flow. The OAuth scopes requested are:

```
data.records:read      - Read records from your bases
data.records:write     - Write records back (for automation actions)
schema.bases:read      - Read your base schema (tables, fields, types)
webhook:manage         - Create and manage webhooks for real-time sync
```

Your Airtable credentials (email and password) are never seen by VayuBridge — the OAuth flow handles authentication entirely on Airtable's servers. VayuBridge receives an access token and refresh token, which are stored encrypted at rest using AES-256.

Token refresh is handled automatically using the refresh token before the access token expires. If refresh fails (user revokes access, Airtable token expires), the sync pauses and you're notified to reconnect.

---

## Step 2: Schema Introspection

Before syncing records, VayuBridge fetches your base's schema using the Airtable Metadata API. This returns a description of every table and every field — including field type, options (for select fields), and linked record references.

VayuBridge maps Airtable field types to PostgreSQL types:

| Airtable Field Type | PostgreSQL Type | Notes |
|---|---|---|
| singleLineText | `TEXT` | |
| multilineText | `TEXT` | |
| number | `NUMERIC` | Preserves decimal precision |
| currency | `NUMERIC` | |
| percent | `NUMERIC` | |
| checkbox | `BOOLEAN` | |
| date | `DATE` | |
| dateTime | `TIMESTAMPTZ` | With timezone |
| singleSelect | `TEXT` | Option label stored |
| multipleSelects | `TEXT[]` | PostgreSQL array |
| multipleRecordLinks | `JSONB` | Array of linked record IDs |
| formula | `TEXT` | Computed value stored |
| rollup | `NUMERIC` or `TEXT` | Depends on rollup type |
| lookup | `JSONB` | Array of looked-up values |
| attachment | `JSONB` | Metadata only, not file content |
| user | `JSONB` | User ID and name |

Complex types (linked records, lookups, attachments) are stored as JSONB to preserve their structure without losing data. This means they're queryable using PostgreSQL's JSONB operators.

Tables are created in Supabase with the naming convention:

```sql
airtable_{base_id_hash}_{table_name_slug}
```

Every synced table includes two metadata columns added by VayuBridge:

```sql
_airtable_id      TEXT PRIMARY KEY  -- Airtable's record ID (recXXXXXX)
_synced_at        TIMESTAMPTZ       -- Timestamp of last sync for this record
```

---

## Step 3: Initial Full Sync

The initial sync paginates through all records in all selected tables using Airtable's List Records API endpoint. Records are fetched in batches of 100 (the API maximum) and bulk-inserted into PostgreSQL.

To avoid serverless function timeouts, the initial sync is broken into chunks and queued. Each queue message processes one page of 100 records and enqueues the next page on completion. This means a base with 500,000 records will process as 5,000 sequential queue messages, each running in well under 10 seconds.

The sync respects Airtable's 5 req/sec rate limit. A token bucket limiter runs at 4 req/sec (leaving a buffer) with exponential backoff on any 429 responses.

Progress is tracked in the `sync_log` table and surfaced in the VayuBridge dashboard as a live progress bar.

---

## Step 4: Real-Time Sync via Webhooks

After the initial sync, VayuBridge registers an Airtable webhook on your base to receive real-time change notifications.

When any record in the base changes, Airtable sends a POST request to VayuBridge's webhook endpoint. The payload includes the change type and the affected record IDs. VayuBridge verifies the webhook signature using HMAC-SHA256 and then fetches the full updated records from Airtable's API.

Changes are applied to PostgreSQL within 30 seconds of the original Airtable change.

**Fallback polling:** If the webhook endpoint is unreachable (rare), VayuBridge falls back to polling the Airtable API every 15 minutes to catch any missed changes.

---

## Step 5: Overflow Automations

The automation overflow engine works by evaluating rules against every incoming webhook change event.

When VayuBridge receives a webhook and determines that a specific field has changed on a specific record, it checks your active automation rules for matching triggers:

```javascript
for (const rule of activeRules) {
  if (
    rule.trigger_table === changedTableId &&
    rule.trigger_field === changedFieldId &&
    evaluateCondition(rule.trigger_condition, newValue)
  ) {
    await executeAction(rule.action_type, rule.action_config, record);
  }
}
```

Supported actions:

- **HTTP POST:** Sends the full record data as a JSON payload to the configured URL.
- **Send email:** Uses Resend's API to send a transactional email with configurable subject and body (supports field value interpolation: `{{field_name}}`).
- **Update Airtable record:** Uses VayuBridge's stored OAuth token to PATCH the record in Airtable's API.

Every action execution is logged with status, start time, end time, and any error details. You can view the last 50 runs per rule in your dashboard.

---

## Data Security

- OAuth tokens are encrypted at rest using AES-256 with per-user encryption keys
- The PostgreSQL database uses Row Level Security — each user can only query tables belonging to their own connected bases
- VayuBridge uses HTTPS for all external communication
- Supabase (the underlying database provider) is SOC 2 Type II certified
- VayuBridge never stores your Airtable email, password, or any credentials — only the OAuth tokens provided by Airtable's authorisation server

---

*If you have questions about the architecture or want to discuss a specific integration pattern, reach out at [hello@vayubridge.com](mailto:hello@vayubridge.com). [Try VayuBridge free →](/login)*
