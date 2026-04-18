import type { Entry, Pillar } from './types'
import { PILLAR_ORDER } from './pillars'
import { getDayKey, shiftDayKey } from './day'

// Group entries by day key -> set of filled pillars.
export function groupByDay(entries: Entry[]): Map<string, Set<Pillar>> {
  const map = new Map<string, Set<Pillar>>()
  for (const e of entries) {
    let set = map.get(e.date)
    if (!set) {
      set = new Set<Pillar>()
      map.set(e.date, set)
    }
    set.add(e.pillar)
  }
  return map
}

export function isDayComplete(filled: Set<Pillar> | undefined): boolean {
  if (!filled) return false
  return PILLAR_ORDER.every((p) => filled.has(p))
}

export interface StreakResult {
  current: number
  longest: number
}

/**
 * Streak rules:
 * - A day is "complete" when all 4 pillars have entries.
 * - Current streak is the number of consecutive complete days ending at
 *   today (or yesterday, if today isn't complete yet but hasn't "missed"
 *   yet — you still have time to finish today).
 * - If the most recent would-be-streak-ending day is incomplete and past,
 *   current streak = 0.
 * - Longest streak is the max run of consecutive complete days ever.
 */
export function computeStreaks(entries: Entry[], now: Date = new Date()): StreakResult {
  const byDay = groupByDay(entries)
  const today = getDayKey(now)

  // CURRENT STREAK
  let current = 0
  // If today is complete, count it and walk back.
  // If today is NOT complete but some pillars are filled OR nothing yet,
  //   start from yesterday (today is still "in progress" — rollover hasn't
  //   happened yet, so incompleteness doesn't break the streak).
  let cursor = today
  if (!isDayComplete(byDay.get(cursor))) {
    cursor = shiftDayKey(cursor, -1)
  }
  while (isDayComplete(byDay.get(cursor))) {
    current++
    cursor = shiftDayKey(cursor, -1)
  }

  // LONGEST STREAK — walk every calendar day from earliest entry to today.
  let longest = 0
  const dayKeys = Array.from(byDay.keys()).sort()
  if (dayKeys.length === 0) return { current, longest: Math.max(current, 0) }

  const start = dayKeys[0]
  let run = 0
  let walker = start
  // Walk forward through calendar days until today (inclusive).
  while (walker <= today) {
    if (isDayComplete(byDay.get(walker))) {
      run++
      if (run > longest) longest = run
    } else {
      run = 0
    }
    walker = shiftDayKey(walker, 1)
  }

  // Current streak could itself be the longest if we're mid-run today.
  if (current > longest) longest = current

  return { current, longest }
}
