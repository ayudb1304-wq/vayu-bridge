import { Client } from "@upstash/qstash"

// Centralised QStash client — respects the regional QSTASH_URL env var
export function createQStashClient() {
  return new Client({
    token: process.env.QSTASH_TOKEN!,
    ...(process.env.QSTASH_URL ? { baseUrl: process.env.QSTASH_URL } : {}),
  })
}
