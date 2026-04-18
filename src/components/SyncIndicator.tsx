interface Props {
  pending: number
  online: boolean
}

export function SyncIndicator({ pending, online }: Props) {
  if (pending === 0 && online) return null
  const label = !online
    ? `Offline${pending ? ` — ${pending} pending` : ''}`
    : `Syncing ${pending}…`
  return (
    <div className="px-5 pb-2">
      <div className="text-[11px] text-neutral-400 bg-neutral-900/80 border border-neutral-800 rounded-full px-3 py-1 inline-flex items-center gap-2">
        <span
          className={online ? 'text-yellow-400' : 'text-neutral-500'}
          aria-hidden
        >
          {online ? '↻' : '○'}
        </span>
        {label}
      </div>
    </div>
  )
}
