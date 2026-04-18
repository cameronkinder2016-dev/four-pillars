import { useMemo, useState } from 'react'
import type { Entry, Pillar } from '../lib/types'
import { PILLAR_META, PILLAR_ORDER } from '../lib/pillars'
import { TopBar } from '../components/TopBar'
import { PillarCard } from '../components/PillarCard'
import { EntryModal } from '../components/EntryModal'
import { SkeletonCard } from '../components/Skeleton'
import { getDayKey } from '../lib/day'
import { computeStreaks } from '../lib/streak'

interface Props {
  entries: Entry[]
  loading: boolean
  onSave: (pillar: Pillar, text: string) => Promise<void>
  onDelete: (pillar: Pillar) => Promise<void>
}

export function TodayScreen({ entries, loading, onSave, onDelete }: Props) {
  const [activePillar, setActivePillar] = useState<Pillar | null>(null)
  const [flashing, setFlashing] = useState<Pillar | null>(null)

  const today = getDayKey()
  const todayEntries = useMemo(() => {
    const map: Partial<Record<Pillar, Entry>> = {}
    for (const e of entries) {
      if (e.date === today) map[e.pillar] = e
    }
    return map
  }, [entries, today])

  const streaks = useMemo(() => computeStreaks(entries), [entries])

  const activeMeta = activePillar ? PILLAR_META[activePillar] : null
  const activeEntry = activePillar ? todayEntries[activePillar] ?? null : null

  const handleSave = async (text: string) => {
    if (!activePillar) return
    await onSave(activePillar, text)
    const p = activePillar
    setFlashing(p)
    setTimeout(() => setFlashing((cur) => (cur === p ? null : cur)), 800)
  }

  const handleDelete = async () => {
    if (!activePillar) return
    await onDelete(activePillar)
  }

  return (
    <>
      <TopBar currentStreak={streaks.current} longestStreak={streaks.longest} />
      <main className="px-5 pb-28 flex flex-col gap-3">
        {loading && entries.length === 0
          ? PILLAR_ORDER.map((p) => <SkeletonCard key={p} />)
          : PILLAR_ORDER.map((p) => (
              <PillarCard
                key={p}
                meta={PILLAR_META[p]}
                entry={todayEntries[p] ?? null}
                onTap={() => setActivePillar(p)}
                flash={flashing === p}
              />
            ))}
        <p className="text-center text-[11px] text-neutral-600 mt-2">
          — entry_time is your wall-clock time; days reset at 4am —
        </p>
      </main>

      {activeMeta && (
        <EntryModal
          meta={activeMeta}
          existing={activeEntry}
          onSave={handleSave}
          onDelete={activeEntry ? handleDelete : undefined}
          onClose={() => setActivePillar(null)}
          key={activePillar /* reset internal state when switching */}
        />
      )}
    </>
  )
}
