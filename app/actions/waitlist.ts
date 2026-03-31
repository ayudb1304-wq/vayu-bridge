"use server"

import { createClient } from "@/utils/supabase/server"

type WaitlistResult =
  | { success: true }
  | { success: false; error: string }

export async function joinWaitlist(
  email: string,
  source: string = "hero"
): Promise<WaitlistResult> {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from("waitlist")
    .insert({ email: email.toLowerCase().trim(), source })

  if (error) {
    // Postgres unique violation code
    if (error.code === "23505") {
      return { success: true } // already on list — treat as success silently
    }
    console.error("[waitlist]", error.message)
    return { success: false, error: "Something went wrong. Please try again." }
  }

  return { success: true }
}
