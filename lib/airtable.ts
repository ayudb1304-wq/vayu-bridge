import { encrypt, decrypt } from "./crypto"
import { createServiceClient } from "@/utils/supabase/service"

type BaseRow = {
  id: string
  airtable_base_id: string
  access_token_enc: string
  refresh_token_enc: string
  token_expires_at: string | null
}

/** Returns a valid access token, refreshing if needed. Updates DB on refresh. */
export async function getValidAccessToken(base: BaseRow): Promise<string> {
  const hasExpiry = !!base.token_expires_at
  const isExpired =
    hasExpiry &&
    Date.now() >= new Date(base.token_expires_at!).getTime() - 5 * 60 * 1000

  if (hasExpiry && !isExpired) {
    return decrypt(base.access_token_enc)
  }

  // Refresh
  const refreshToken = decrypt(base.refresh_token_enc)
  const res = await fetch("https://airtable.com/oauth2/v1/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  })

  if (!res.ok) {
    throw new Error(`Airtable token refresh failed: ${res.status}`)
  }

  const tokens = (await res.json()) as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()
  const db = createServiceClient()
  await db.from("connected_bases").update({
    access_token_enc: encrypt(tokens.access_token),
    refresh_token_enc: encrypt(tokens.refresh_token),
    token_expires_at: expiresAt,
  }).eq("id", base.id)

  return tokens.access_token
}

/** Fetch any Airtable API endpoint; throws on non-2xx. */
export async function airtableFetch<T = unknown>(
  url: string,
  token: string
): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Airtable API ${res.status}: ${text}`)
  }
  return res.json() as Promise<T>
}

/** Register an Airtable webhook and return { webhookId, macSecretBase64 }. */
export async function registerAirtableWebhook(
  baseId: string,
  token: string,
  notificationUrl: string
): Promise<{ webhookId: string; macSecretBase64: string }> {
  const res = await fetch(`https://api.airtable.com/v0/bases/${baseId}/webhooks`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      notificationUrl,
      specification: {
        options: {
          filters: {
            fromSources: ["client", "publicApi", "automation", "system"],
            dataTypes: ["tableData"],
          },
        },
      },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Webhook registration failed: ${res.status} ${text}`)
  }

  const data = (await res.json()) as { id: string; macSecretBase64: string }
  return { webhookId: data.id, macSecretBase64: data.macSecretBase64 }
}
