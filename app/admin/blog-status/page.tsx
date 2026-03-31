import { getAllPosts, isPostLive } from "@/lib/posts"

function getStatus(post: ReturnType<typeof getAllPosts>[0]) {
  if (isPostLive(post)) return "Live"
  if (post.published === false) return "Scheduled"
  return "Draft"
}

function getDaysUntil(dateStr: string): number {
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

export default function BlogStatusPage() {
  const posts = getAllPosts()

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="font-heading mb-2 text-2xl font-bold text-foreground">Blog Status</h1>
      <p className="mb-10 text-sm text-muted-foreground">
        Read-only view of all scheduled posts and their publish state.
      </p>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Title</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                Publish Date
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                Days Until
              </th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">
                Read Time
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, i) => {
              const status = getStatus(post)
              const daysUntil = getDaysUntil(post.publishDate)
              const isLive = status === "Live"

              return (
                <tr
                  key={post.slug}
                  className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                >
                  <td className="px-4 py-3 text-foreground">
                    <span className="font-medium">{post.title}</span>
                    <span className="font-mono mt-0.5 block text-[10px] text-muted-foreground">
                      /blog/{post.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {post.publishDate}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        isLive
                          ? "bg-emerald-50 text-emerald-700"
                          : status === "Scheduled"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {isLive ? (
                      <span className="text-emerald-600">Live now</span>
                    ) : daysUntil <= 0 ? (
                      <span className="text-amber-600">Due — run publish script</span>
                    ) : (
                      `${daysUntil}d`
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{post.readTime} min</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        To publish scheduled posts: run{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono">
          node scripts/publish-scheduled-posts.js
        </code>{" "}
        locally, commit, and push.
      </p>
    </div>
  )
}
