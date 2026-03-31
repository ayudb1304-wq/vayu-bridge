"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Database, Zap, Settings, LogOut, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Bases", href: "/dashboard", icon: Database },
  { label: "Automations", href: "/dashboard/automations", icon: Zap },
]

interface SidebarProps {
  email: string
  children?: React.ReactNode // usage bar slot
}

function NavContent({ email, children }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="px-4 py-5">
        <Link href="/dashboard" className="font-mono text-lg font-bold tracking-tight">
          VayuBridge
        </Link>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard" || pathname.match(/^\/dashboard\/[^/]+$/) && !pathname.includes("automations") && !pathname.includes("settings")
              : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="mt-auto space-y-3 px-3 pb-4">
        {/* Usage bar */}
        {children && <div className="rounded-md border border-border bg-muted/30 p-3">{children}</div>}

        <Separator />

        {/* Settings */}
        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
            pathname === "/dashboard/settings"
              ? "bg-muted text-foreground"
              : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
          )}
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>

        {/* Profile + Sign out */}
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2.5">
          <p className="truncate text-xs text-muted-foreground">{email}</p>
          <form action="/auth/signout" method="post" className="mt-1.5">
            <button
              type="submit"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3 w-3" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export function Sidebar({ email, children }: SidebarProps) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-background">
        <NavContent email={email}>{children}</NavContent>
      </aside>

      {/* Mobile header + sheet */}
      <div className="flex h-14 items-center border-b border-border px-4 md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <NavContent email={email}>{children}</NavContent>
          </SheetContent>
        </Sheet>
        <Link href="/dashboard" className="ml-3 font-mono text-sm font-bold tracking-tight">
          VayuBridge
        </Link>
      </div>
    </>
  )
}
