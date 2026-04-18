// Data-access layer for the `entries` table.
// Every caller goes through here — no direct Supabase calls elsewhere.

import { supabase } from './supabase'
import type { Entry, EntryDraft, Pillar } from './types'
import { enqueue, readQueue, removeMatching } from './queue'

// Pull last N days of entries (covers streak calculation and history heatmap).
export async function fetchRecentEntries(
  sinceDate: string,
): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .gte('date', sinceDate)
    .order('date', { ascending: false })
  if (error) throw error
  return (data ?? []) as Entry[]
}

export async function fetchAllEntries(): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('date', { ascending: false })
  if (error) throw error
  return (data ?? []) as Entry[]
}

// Upsert using (date, pillar) conflict target, set by the unique constraint.
export async function saveEntry(draft: EntryDraft): Promise<Entry> {
  const { data, error } = await supabase
    .from('entries')
    .upsert(draft, { onConflict: 'date,pillar' })
    .select('*')
    .single()
  if (error) throw error
  return data as Entry
}

export async function deleteEntry(date: string, pillar: Pillar): Promise<void> {
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('date', date)
    .eq('pillar', pillar)
  if (error) throw error
}

export async function deleteAllEntries(): Promise<void> {
  // Supabase requires a filter on delete; this matches everything.
  const { error } = await supabase.from('entries').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw error
}

/**
 * Save with offline fallback. On failure, enqueue and return a synthetic
 * Entry so the UI can still render optimistically.
 */
export async function saveEntryWithQueue(
  draft: EntryDraft,
): Promise<{ entry: Entry; queued: boolean }> {
  try {
    const entry = await saveEntry(draft)
    // If this same (date, pillar) was previously queued, clear it.
    removeMatching(draft.date, draft.pillar)
    return { entry, queued: false }
  } catch {
    enqueue(draft)
    const nowIso = new Date().toISOString()
    const synthetic: Entry = {
      id: `local:${draft.date}:${draft.pillar}`,
      date: draft.date,
      pillar: draft.pillar,
      text: draft.text,
      entry_time: draft.entry_time,
      created_at: nowIso,
      updated_at: nowIso,
    }
    return { entry: synthetic, queued: true }
  }
}

/**
 * Flush all queued drafts. Returns number successfully synced. Items that
 * still fail remain in the queue for the next attempt.
 */
export async function flushQueue(): Promise<number> {
  const pending = readQueue()
  if (pending.length === 0) return 0
  let synced = 0
  for (const item of pending) {
    try {
      await saveEntry({
        date: item.date,
        pillar: item.pillar,
        text: item.text,
        entry_time: item.entry_time,
      })
      removeMatching(item.date, item.pillar)
      synced++
    } catch {
      // Leave in queue, will try again on next flush.
    }
  }
  return synced
}
