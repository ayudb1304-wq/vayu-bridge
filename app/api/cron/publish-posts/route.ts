// app/api/cron/publish-posts/route.ts
//
// Vercel Cron endpoint — runs every Monday at 09:00 UTC (see vercel.json).
// The Vercel filesystem is read-only in production, so this route cannot modify .md files.
// Instead it:
//   1. Checks which posts are due to go live (publishDate <= today AND published = false)
//   2. Logs them
//   3. Triggers a Vercel Deploy Hook (set VERCEL_DEPLOY_HOOK_URL in env vars) so the
//      next build picks up any frontmatter changes committed via the local script.
//
// Workflow:
//   - Run `node scripts/publish-scheduled-posts.js` locally each week to flip frontmatter
//   - Commit + push → Vercel deploys, new posts go live
//   - This cron also fires a deploy hook as a safety net even without a manual commit

import { getAllPosts } from "@/lib/posts"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  // Protect the endpoint in production
  const authHeader = request.headers.get("authorization")
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const allPosts = getAllPosts()
  const duePosts = allPosts.filter((p) => {
    const publishDate = new Date(p.publishDate)
    publishDate.setHours(0, 0, 0, 0)
    return publishDate <= today && p.published === false
  })

  if (duePosts.length > 0) {
    console.log(
      `[cron/publish-posts] ${duePosts.length} post(s) due:`,
      duePosts.map((p) => p.slug)
    )

    // Trigger a Vercel Deploy Hook to rebuild the site
    const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
    if (deployHookUrl) {
      await fetch(deployHookUrl, { method: "POST" })
      console.log("[cron/publish-posts] Deploy hook triggered.")
    } else {
      console.warn(
        "[cron/publish-posts] VERCEL_DEPLOY_HOOK_URL not set — skipping deploy trigger. " +
        "Run `node scripts/publish-scheduled-posts.js` locally and commit the changes."
      )
    }
  } else {
    console.log("[cron/publish-posts] No posts due today.")
  }

  return NextResponse.json({
    checked: allPosts.length,
    due: duePosts.map((p) => ({ slug: p.slug, publishDate: p.publishDate })),
    deployTriggered: duePosts.length > 0 && !!process.env.VERCEL_DEPLOY_HOOK_URL,
  })
}
