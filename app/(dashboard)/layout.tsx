import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"
import { Button } from "@/components/ui/button"
import { UsageBarServer } from "@/components/dashboard/usage-bar-server"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border px-6 h-14 flex items-center justify-between">
        <Link href="/dashboard" className="font-mono font-bold text-lg tracking-tight">
          VayuBridge
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/dashboard" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
            Bases
          </Link>
          <Link href="/dashboard/automations" className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-muted">
            Automations
          </Link>
        </nav>
        <form action="/auth/signout" method="post">
          <Button variant="ghost" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </header>
      <div className="border-b border-border px-6 py-3">
        <Suspense>
          <UsageBarServer userId={user.id} />
        </Suspense>
      </div>
      <main className="p-6">{children}</main>
    </div>
  )
}
