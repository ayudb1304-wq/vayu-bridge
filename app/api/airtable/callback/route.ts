import { createClient } from "@/utils/supabase/server"
import { encrypt } from "@/lib/crypto"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const state = searchParams.get("state")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(`${origin}/dashboard?error=airtable_denied`)
  }

  if (!code || !state) {
    return NextResponse.redirect(`${origin}/dashboard?error=airtable_invalid`)
  }

  // Validate state + retrieve PKCE verifier from cookies
  const storedState = request.cookies.get("airtable_oauth_state")?.value
  const codeVerifier = request.cookies.get("airtable_pkce_verifier")?.value

  if (!storedState || storedState !== state || !codeVerifier) {
    return NextResponse.redirect(`${origin}/dashboard?error=airtable_state_mismatch`)
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://airtable.com/oauth2/v1/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(
        `${process.env.AIRTABLE_CLIENT_ID}:${process.env.AIRTABLE_CLIENT_SECRET}`
      ).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.AIRTABLE_REDIRECT_URI!,
      code_verifier: codeVerifier,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${origin}/dashboard?error=airtable_token_exchange`)
  }

  const tokens = await tokenRes.json() as {
    access_token: string
    refresh_token: string
    expires_in: number
  }

  // Fetch the list of bases the user authorised
  const basesRes = await fetch("https://api.airtable.com/v0/meta/bases", {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  })

  if (!basesRes.ok) {
    return NextResponse.redirect(`${origin}/dashboard?error=airtable_bases_fetch`)
  }

  const { bases } = await basesRes.json() as {
    bases: Array<{ id: string; name: string }>
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(`${origin}/login`)
  }

  // Upsert each base (encrypt tokens)
  const accessEnc = encrypt(tokens.access_token)
  const refreshEnc = encrypt(tokens.refresh_token)
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000).toISOString()

  for (const base of bases) {
    await supabase.from("connected_bases").upsert(
      {
        user_id: user.id,
        airtable_base_id: base.id,
        base_name: base.name,
        access_token_enc: accessEnc,
        refresh_token_enc: refreshEnc,
        token_expires_at: expiresAt,
        sync_status: "pending",
      },
      { onConflict: "user_id,airtable_base_id" }
    )
  }

  // Clear PKCE cookies
  const response = NextResponse.redirect(`${origin}/dashboard`)
  response.cookies.delete("airtable_pkce_verifier")
  response.cookies.delete("airtable_oauth_state")

  return response
}
