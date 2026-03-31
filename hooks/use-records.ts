"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { RecordsResponse } from "@/app/api/records/[baseId]/route"

export type SyncedRecord = {
  id: string
  airtable_record_id: string
  fields: Record<string, unknown>
}

type Params = {
  baseId: string
  table: string
  search: string
  sort: string
  filters: string
}

type State = {
  records: SyncedRecord[]
  totalCount: number | null
  isFetching: boolean
  hasMore: boolean
  error: string | null
}

export function useRecords({ baseId, table, search, sort, filters }: Params) {
  const [state, setState] = useState<State>({
    records: [],
    totalCount: null,
    isFetching: false,
    hasMore: true,
    error: null,
  })

  const cursorRef = useRef<string | null>(null)
  const paramsRef = useRef({ table, search, sort, filters })

  // Reset when any query param changes
  const paramsKey = `${table}|${search}|${sort}|${filters}`
  const prevKeyRef = useRef(paramsKey)

  const fetchPage = useCallback(
    async (reset: boolean) => {
      if (!table) return
      setState((s) => ({ ...s, isFetching: true, error: null }))

      const cursor = reset ? null : cursorRef.current
      const url = new URL(`/api/records/${baseId}`, window.location.origin)
      url.searchParams.set("table", table)
      if (cursor) url.searchParams.set("cursor", cursor)
      if (search) url.searchParams.set("search", search)
      if (sort) url.searchParams.set("sort", sort)
      if (filters) url.searchParams.set("filters", filters)

      try {
        const res = await fetch(url.toString())
        if (!res.ok) throw new Error(await res.text())
        const json: RecordsResponse = await res.json()

        cursorRef.current = json.nextCursor

        setState((s) => ({
          records: reset ? json.records : [...s.records, ...json.records],
          totalCount: json.totalCount ?? s.totalCount,
          isFetching: false,
          hasMore: json.nextCursor !== null,
          error: null,
        }))
      } catch (e) {
        setState((s) => ({ ...s, isFetching: false, error: (e as Error).message }))
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseId, paramsKey]
  )

  useEffect(() => {
    const isReset = prevKeyRef.current !== paramsKey
    prevKeyRef.current = paramsKey
    cursorRef.current = null
    fetchPage(isReset || true)
  }, [paramsKey, fetchPage])

  const fetchNextPage = useCallback(() => {
    if (!state.isFetching && state.hasMore) fetchPage(false)
  }, [state.isFetching, state.hasMore, fetchPage])

  return { ...state, fetchNextPage }
}
