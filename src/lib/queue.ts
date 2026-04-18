// Offline save queue, backed by localStorage.
//
// When a save fails (network offline, Supabase unreachable, etc.) we stash
// the draft here so the UI can show "pending sync" and flush it later.

import type { EntryDraft } from './types'

const KEY = 'four-pillars:pending-queue:v1'

export interface PendingItem extends EntryDraft {
  queuedAt: string // ISO timestamp
}

export function readQueue(): PendingItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as PendingItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function writeQueue(items: PendingItem[]): void {
  localStorage.setItem(KEY, JSON.stringify(items))
}

export function enqueue(draft: EntryDraft): PendingItem[] {
  const items = readQueue()
  // Dedupe on (date, pillar) — last write wins.
  const filtered = items.filter(
    (i) => !(i.date === draft.date && i.pillar === draft.pillar),
  )
  filtered.push({ ...draft, queuedAt: new Date().toISOString() })
  writeQueue(filtered)
  return filtered
}

export function removeMatching(date: string, pillar: string): PendingItem[] {
  const items = readQueue()
  const filtered = items.filter((i) => !(i.date === date && i.pillar === pillar))
  writeQueue(filtered)
  return filtered
}

export function clearQueue(): void {
  writeQueue([])
}
