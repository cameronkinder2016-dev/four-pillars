// Shared domain types for the app.

export const PILLARS = ['physical', 'mental', 'spiritual', 'social'] as const
export type Pillar = (typeof PILLARS)[number]

export interface Entry {
  id: string
  date: string // YYYY-MM-DD (4am-rollover local day)
  pillar: Pillar
  text: string
  entry_time: string | null // HH:MM, wall-clock time user saved it
  created_at: string
  updated_at: string
}

// Draft used by UI/queue before the row has an id from Supabase.
export interface EntryDraft {
  date: string
  pillar: Pillar
  text: string
  entry_time: string | null
}
