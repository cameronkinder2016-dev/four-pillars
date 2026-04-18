import { useCallback, useEffect, useRef, useState } from 'react'
import type { Entry, Pillar } from './lib/types'
import {
  deleteEntry,
  fetchRecentEntries,
  flushQueue,
  saveEntryWithQueue,
} from './lib/entries'
import { readQueue } from './lib/queue'
import { getDayKey, nowTimeString, shiftDayKey } from './lib/day'
import { BottomNav, type Tab } from './components/BottomNav'
import { SyncIndicator } from './components/SyncIndicator'
import { TodayScreen } from './screens/Today'
import { HistoryScreen } from './screens/History'
import { SettingsScreen } from './screens/Settings'

// 90 days covers the 13-week history heatmap and streak math without
// pulling the full archive on every load.
const FETCH_WINDOW_DAYS = 90

export default function App() {
  const [tab, setTab] = useState<Tab>('today')
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [pending, setPending] = useState(0)
  const [online, setOnline] = useState(() => navigator.onLine)
  const flushInFlight = useRef(false)

  const refreshPending = useCallback(() => {
    setPending(readQueue().length)
  }, [])

  const reload = useCallback(async () => {
    const since = shiftDayKey(getDayKey(), -FETCH_WINDOW_DAYS)
    try {
      const data = await fetchRecentEntries(since)
      setEntries(data)
    } catch (e) {
      console.error('Failed to fetch entries:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const tryFlush = useCallback(async () => {
    if (flushInFlight.current) return
    if (readQueue().length === 0) return
    flushInFlight.current = true
    try {
      const synced = await flushQueue()
      if (synced > 0) {
        await reload()
      }
      refreshPending()
    } finally {
      flushInFlight.current = false
    }
  }, [reload, refreshPending])

  // Initial load, online/offline tracking, focus-based flush.
  useEffect(() => {
    void reload()
    refreshPending()

    const onOnline = () => {
      setOnline(true)
      void tryFlush()
    }
    const onOffline = () => setOnline(false)
    const onFocus = () => {
      if (navigator.onLine) void tryFlush()
    }
    const onVis = () => {
      if (document.visibilityState === 'visible' && navigator.onLine) {
        void tryFlush()
      }
    }

    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVis)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [reload, refreshPending, tryFlush])

  const handleSave = useCallback(
    async (pillar: Pillar, text: string) => {
      const date = getDayKey()
      const draft = { date, pillar, text, entry_time: nowTimeString() }

      // Optimistic update: render the entry immediately.
      setEntries((prev) => {
        const filtered = prev.filter(
          (e) => !(e.date === date && e.pillar === pillar),
        )
        const nowIso = new Date().toISOString()
        const optimistic: Entry = {
          id: `local:${date}:${pillar}`,
          date,
          pillar,
          text,
          entry_time: draft.entry_time,
          created_at: nowIso,
          updated_at: nowIso,
        }
        return [optimistic, ...filtered]
      })

      const { queued } = await saveEntryWithQueue(draft)
      refreshPending()
      if (!queued) {
        // Server accepted — refetch to replace the synthetic id with the real row.
        void reload()
      }
    },
    [reload, refreshPending],
  )

  const handleDelete = useCallback(
    async (pillar: Pillar) => {
      const date = getDayKey()
      setEntries((prev) =>
        prev.filter((e) => !(e.date === date && e.pillar === pillar)),
      )
      try {
        await deleteEntry(date, pillar)
      } catch (e) {
        console.error('Delete failed, reloading:', e)
        void reload()
      }
    },
    [reload],
  )

  return (
    <div className="min-h-full max-w-md mx-auto">
      <SyncIndicator pending={pending} online={online} />

      {tab === 'today' && (
        <TodayScreen
          entries={entries}
          loading={loading}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
      {tab === 'history' && <HistoryScreen entries={entries} />}
      {tab === 'settings' && <SettingsScreen onAfterReset={reload} />}

      <BottomNav tab={tab} onChange={setTab} />
    </div>
  )
}
