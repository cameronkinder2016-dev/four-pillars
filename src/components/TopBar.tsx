import { formatPrettyDate, getDayKey } from '../lib/day'

interface Props {
  currentStreak: number
  longestStreak: number
}

export function TopBar({ currentStreak, longestStreak }: Props) {
  const date = formatPrettyDate(getDayKey())
  return (
    <header className="flex items-center justify-between px-5 pt-6 pb-4">
      <div>
        <div className="text-xs uppercase tracking-widest text-neutral-500">
          Today
        </div>
        <div className="text-lg font-medium text-neutral-100">{date}</div>
      </div>
      <div className="text-right">
        <div className="text-2xl font-semibold text-orange-400">
          <span aria-label="current streak">🔥 {currentStreak}</span>
        </div>
        <div className="text-xs text-neutral-500">
          longest {longestStreak}
        </div>
      </div>
    </header>
  )
}
