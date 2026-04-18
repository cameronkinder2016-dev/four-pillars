import { useMemo, useState } from 'react'
import type { Entry } from '../lib/types'
import { PILLAR_META, PILLAR_ORDER } from '../lib/pillars'
import { formatPrettyDate, getDayKey, parseDayKey, shiftDayKey } from '../lib/day'
import { groupByDay } from '../lib/streak'

interface Props {
  entries: Entry[]
}

// 13 weeks * 7 days = 91 cells, GitHub-style.
const WEEKS = 13

export function HistoryScreen({ entries }: Props) {
  const byDay = useMemo(() => groupByDay(entries), [entries])
  const today = getDayKey()
  const [selected, setSelected] = useState<string | null>(null)

  // We render a grid of WEEKS columns by 7 rows. Monday = row 0, Sunday = row 6.
  // The rightmost column's bottom edge aligns with today's day-of-week.
  const todayDate = parseDayKey(today)
  const todayRow = (todayDate.getDay() + 6) % 7 // Mon=0 .. Sun=6
  const topLeftDaysBack = (WEEKS - 1) * 7 + todayRow

  const colorFor = (key: string): string => {
    const filled = byDay.get(key)
    const n = filled ? filled.size : 0
    switch (n) {
      case 0: return 'rgba(255,255,255,0.05)'
      case 1: return 'rgba(34,197,94,0.25)'
      case 2: return 'rgba(34,197,94,0.5)'
      case 3: return 'rgba(34,197,94,0.75)'
      case 4: return 'rgba(34,197,94,1)'
      default: return 'rgba(255,255,255,0.05)'
    }
  }

  const selectedEntries = useMemo(() => {
    if (!selected) return []
    return entries.filter((e) => e.date === selected)
  }, [entries, selected])

  // Build the flat cell list column-major: for each week col, then each row.
  const cells: Array<{ key: string | null; col: number; row: number }> = []
  for (let col = 0; col < WEEKS; col++) {
    for (let row = 0; row < 7; row++) {
      const offset = col * 7 + row
      const daysBack = topLeftDaysBack - offset
      if (daysBack < 0) {
        cells.push({ key: null, col, row })
      } else {
        cells.push({ key: shiftDayKey(today, -daysBack), col, row })
      }
    }
  }

  return (
    <div className="px-5 pt-6 pb-28">
      <h1 className="text-xl font-medium text-neutral-100 mb-1">History</h1>
      <p className="text-sm text-neutral-500 mb-5">
        Last {WEEKS} weeks — green intensity = pillars filled.
      </p>

      <div className="overflow-x-auto pb-2">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${WEEKS}, 1fr)`,
            gridTemplateRows: 'repeat(7, 1fr)',
            gridAutoFlow: 'column',
            minWidth: WEEKS * 18,
          }}
        >
          {cells.map((cell, i) => {
            if (!cell.key) return <div key={`blank-${i}`} className="aspect-square" />
            const isSelected = selected === cell.key
            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => setSelected(cell.key)}
                aria-label={cell.key}
                className="aspect-square rounded-sm transition-all"
                style={{
                  backgroundColor: colorFor(cell.key),
                  outline: isSelected ? '2px solid #f5f5f5' : 'none',
                  outlineOffset: '1px',
                }}
              />
            )
          })}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[11px] text-neutral-500">
        <span>less</span>
        {[0, 1, 2, 3, 4].map((n) => (
          <span
            key={n}
            className="w-3 h-3 rounded-sm"
            style={{
              background:
                n === 0 ? 'rgba(255,255,255,0.05)' : `rgba(34,197,94,${0.25 * n})`,
            }}
          />
        ))}
        <span>more</span>
      </div>

      <div className="mt-8">
        {selected ? (
          <>
            <h2 className="text-sm uppercase tracking-widest text-neutral-500 mb-3">
              {formatPrettyDate(selected)}
            </h2>
            {selectedEntries.length === 0 ? (
              <p className="text-neutral-500 text-sm">No entries this day.</p>
            ) : (
              <div className="space-y-3">
                {PILLAR_ORDER.map((p) => {
                  const e = selectedEntries.find((x) => x.pillar === p)
                  const meta = PILLAR_META[p]
                  return (
                    <div
                      key={p}
                      className="rounded-xl p-4 border"
                      style={{
                        backgroundColor: e ? meta.accentSoft : 'rgba(255,255,255,0.02)',
                        borderColor: e ? meta.accent : 'rgba(255,255,255,0.06)',
                      }}
                    >
                      <div
                        className="text-xs uppercase tracking-widest mb-1"
                        style={{ color: e ? meta.accent : '#6b7280' }}
                      >
                        {meta.emoji} {meta.label}
                        {e?.entry_time && (
                          <span className="ml-2 text-neutral-500 normal-case tracking-normal">
                            {e.entry_time}
                          </span>
                        )}
                      </div>
                      {e ? (
                        <p className="text-[15px] text-neutral-100 whitespace-pre-wrap">
                          {e.text}
                        </p>
                      ) : (
                        <p className="text-sm text-neutral-600 italic">— not logged —</p>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <p className="text-neutral-500 text-sm">Tap a day to see its entries.</p>
        )}
      </div>
    </div>
  )
}
