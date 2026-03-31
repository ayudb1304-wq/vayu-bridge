"use client"

import { useState, useTransition } from "react"
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { joinWaitlist } from "@/app/actions/waitlist"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  source?: string
  placeholder?: string
  buttonLabel?: string
  className?: string
  /**
   * "default" — used on light/neutral backgrounds (white input, filled button)
   * "inverted" — used on dark/foreground backgrounds (outlined transparent input, white button)
   */
  variant?: "default" | "inverted"
}

export function WaitlistForm({
  source = "hero",
  placeholder = "Enter your work email",
  buttonLabel = "Join the Waitlist",
  className,
  variant = "default",
}: Props) {
  const [email, setEmail] = useState("")
  const [done, setDone] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrorMsg("")
    startTransition(async () => {
      const result = await joinWaitlist(email, source)
      if (result.success) {
        setDone(true)
      } else {
        setErrorMsg(result.error)
      }
    })
  }

  const isInverted = variant === "inverted"

  if (done) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-sm",
          isInverted ? "text-background" : "text-foreground",
          className
        )}
      >
        <CheckCircle2
          className={cn("h-4 w-4 shrink-0", isInverted ? "text-emerald-400" : "text-emerald-500")}
        />
        <span>You&rsquo;re on the list! We&rsquo;ll email you when we launch.</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className={cn("w-full", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "h-10 flex-1 rounded-md border px-3 text-sm focus:outline-none focus:ring-2",
            isInverted
              ? "border-background/30 bg-background/10 text-background placeholder:text-background/50 focus:ring-background/20 focus:border-background/60"
              : "border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-foreground/20"
          )}
        />
        <Button
          type="submit"
          disabled={isPending}
          size="sm"
          className={cn(
            "h-10 shrink-0 gap-1.5 px-4",
            isInverted &&
              "bg-background text-foreground hover:bg-background/90 focus-visible:ring-background/30"
          )}
        >
          {isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              {buttonLabel}
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>
      {errorMsg && (
        <p className={cn("mt-1.5 text-xs", isInverted ? "text-red-300" : "text-red-500")}>
          {errorMsg}
        </p>
      )}
    </form>
  )
}
