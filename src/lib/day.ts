// "Day" = 4am local -> 4am next day. So if it's 3am on Apr 18, the
// logical day is still Apr 17. All `date` strings in the DB are keyed by
// this logical day, formatted YYYY-MM-DD in the user's local timezone.

const ROLLOVER_HOUR = 4

export function getDayKey(now: Date = new Date()): string {
  const d = new Date(now)
  if (d.getHours() < ROLLOVER_HOUR) {
    d.setDate(d.getDate() - 1)
  }
  return formatDateKey(d)
}

export function formatDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Returns the YYYY-MM-DD key for N days before the reference date.
export function shiftDayKey(key: string, deltaDays: number): string {
  const d = parseDayKey(key)
  d.setDate(d.getDate() + deltaDays)
  return formatDateKey(d)
}

export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d) // local midnight; we only use the calendar part
}

// Wall-clock HH:MM (24h) for the entry_time column.
export function nowTimeString(now: Date = new Date()): string {
  const h = String(now.getHours()).padStart(2, '0')
  const m = String(now.getMinutes()).padStart(2, '0')
  return `${h}:${m}`
}

// Pretty date for the top bar, e.g. "Friday, April 17"
export function formatPrettyDate(key: string): string {
  const d = parseDayKey(key)
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

// Returns the last N day keys ending with today (inclusive), oldest first.
export function lastNDays(n: number, now: Date = new Date()): string[] {
  const today = getDayKey(now)
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    out.push(shiftDayKey(today, -i))
  }
  return out
}
