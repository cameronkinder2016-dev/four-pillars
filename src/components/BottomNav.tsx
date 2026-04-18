export type Tab = 'today' | 'history' | 'settings'

interface Props {
  tab: Tab
  onChange: (tab: Tab) => void
}

const ITEMS: { key: Tab; label: string; icon: string }[] = [
  { key: 'today', label: 'Today', icon: '☀️' },
  { key: 'history', label: 'History', icon: '📅' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
]

export function BottomNav({ tab, onChange }: Props) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-neutral-950/95 backdrop-blur border-t border-neutral-800 z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="max-w-md mx-auto flex">
        {ITEMS.map((item) => {
          const active = item.key === tab
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key)}
              className={[
                'flex-1 min-h-[60px] flex flex-col items-center justify-center gap-1',
                'text-xs transition-colors',
                active ? 'text-neutral-100' : 'text-neutral-500',
              ].join(' ')}
            >
              <span className="text-xl" aria-hidden>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
