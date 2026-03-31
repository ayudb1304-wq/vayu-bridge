"use client"

type Props = {
  tables: string[]
  activeTable: string
  onChange: (table: string) => void
}

export function TableTabs({ tables, activeTable, onChange }: Props) {
  if (tables.length <= 1) return null

  return (
    <div className="flex gap-1 border-b border-border overflow-x-auto pb-px">
      {tables.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`shrink-0 px-3 py-1.5 text-sm font-mono rounded-t transition-colors
            ${
              t === activeTable
                ? "border border-b-background border-border bg-background text-foreground -mb-px"
                : "text-muted-foreground hover:text-foreground"
            }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
