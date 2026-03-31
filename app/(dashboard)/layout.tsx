import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
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
    <div className="flex min-h-screen bg-background">
      <Sidebar email={user.email ?? ""}>
        <Suspense>
          <UsageBarServer userId={user.id} />
        </Suspense>
      </Sidebar>

      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
