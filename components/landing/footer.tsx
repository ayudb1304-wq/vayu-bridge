import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function Footer() {
  return (
    <footer className="py-10">
      <div className="mx-auto max-w-7xl px-6">
        <Separator className="mb-8" />
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <span className="font-heading text-sm font-bold text-foreground">VayuBridge</span>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Break free from Airtable limits. Keep everything you love.
            </p>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="mailto:hello@vayubridge.com" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">
          © 2026 VayuBridge. Built by a solo developer.
        </p>
      </div>
    </footer>
  )
}
