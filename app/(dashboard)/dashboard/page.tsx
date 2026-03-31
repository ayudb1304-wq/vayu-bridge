import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center gap-6">
      <div className="space-y-2">
        <h1 className="font-mono text-3xl font-bold tracking-tight">No bases connected yet</h1>
        <p className="text-muted-foreground max-w-sm">
          Connect your Airtable base to start syncing records — no limits, no migration.
        </p>
      </div>
      <Card className="w-full max-w-sm text-left">
        <CardHeader>
          <CardTitle className="font-mono text-base">Connect Airtable</CardTitle>
          <CardDescription>
            Authorise VayuBridge to read your base. Takes 90 seconds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" disabled>
            Connect Airtable Base
          </Button>
          <p className="text-xs text-muted-foreground mt-2">Airtable OAuth — coming in Phase 3</p>
        </CardContent>
      </Card>
    </div>
  )
}
