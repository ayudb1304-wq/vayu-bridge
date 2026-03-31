import { createClient } from "@/utils/supabase/server"
import { NextResponse } from "next/server"
import crypto from "crypto"

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const clientId = process.env.AIRTABLE_CLIENT_ID!
  const redirectUri = process.env.AIRTABLE_REDIRECT_URI!

  // PKCE: generate code verifier + challenge
  const codeVerifier = crypto.randomBytes(64).toString("base64url")
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url")

  const state = crypto.randomBytes(16).toString("hex")

  // Store verifier + state in Supabase Auth session metadata (server-side cookie alternative)
  // We use a short-lived entry in a pkce_state table, or store in the response cookie.
  // Simplest approach: store in a signed cookie via NextResponse
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope:
      "data.records:read data.records:write schema.bases:read webhook:manage",
    state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  })

  const authUrl = `https://airtable.com/oauth2/v1/authorize?${params}`

  const response = NextResponse.redirect(authUrl)

  // Store PKCE verifier and state in httpOnly cookies (valid for 10 min)
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 600,
    path: "/",
  }
  response.cookies.set("airtable_pkce_verifier", codeVerifier, cookieOpts)
  response.cookies.set("airtable_oauth_state", state, cookieOpts)

  return response
}
