import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
        <form action="/auth/signout" method="post">
          <Button variant="ghost" size="sm" type="submit">
            Sign out
          </Button>
        </form>
      </header>
      <main className="p-6">{children}</main>
    </div>
  )
}
