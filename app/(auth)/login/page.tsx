"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSubmitted(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="font-mono font-bold text-xl text-foreground">
            VayuBridge
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="font-mono text-2xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send you a magic link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="space-y-2">
                <p className="text-sm text-foreground">
                  Check your inbox — we sent a sign-in link to{" "}
                  <strong className="font-mono">{email}</strong>.
                </p>
                <p className="text-xs text-muted-foreground">
                  Didn&apos;t receive it?{" "}
                  <button
                    onClick={() => setSubmitted(false)}
                    className="underline underline-offset-2 hover:text-foreground"
                  >
                    Try again
                  </button>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending…" : "Send Magic Link"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
