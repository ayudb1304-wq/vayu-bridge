"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { useState } from "react"

export function ConnectAirtableButton() {
  const [loading, setLoading] = useState(false)

  function handleConnect() {
    setLoading(true)
    // Navigating to the connect route triggers the OAuth redirect server-side
    window.location.href = "/api/airtable/connect"
  }

  return (
    <Button onClick={handleConnect} disabled={loading} size="lg">
      <ExternalLink className="mr-2 h-4 w-4" />
      {loading ? "Redirecting to Airtable…" : "Connect Airtable Base"}
    </Button>
  )
}
