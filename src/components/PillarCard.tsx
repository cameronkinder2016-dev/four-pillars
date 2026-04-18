import type { Entry } from '../lib/types'
import type { PillarMeta } from '../lib/pillars'

interface Props {
  meta: PillarMeta
  entry: Entry | null
  onTap: () => void
  flash?: boolean // triggers a brief green pulse after save
}

export function PillarCard({ meta, entry, onTap, flash }: Props) {
  const filled = !!entry

  return (
    <button
      type="button"
      onClick={onTap}
      className={[
        'w-full text-left rounded-2xl p-5 min-h-[120px]',
        'border transition-all duration-200',
        'active:scale-[0.98]',
        flash ? 'ring-2 ring-green-400/60' : '',
      ].join(' ')}
      style={{
        backgroundColor: filled ? meta.accentSoft : 'rgba(255,255,255,0.03)',
        borderColor: filled ? meta.accent : 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl leading-none" aria-hidden>
          {meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div
              className="text-sm font-semibold tracking-wide uppercase"
              style={{ color: filled ? meta.accent : '#9ca3af' }}
            >
              {meta.label}
            </div>
            {filled && (
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                {entry.entry_time && <span>{entry.entry_time}</span>}
                <span aria-hidden className="text-green-400">✓</span>
              </div>
            )}
          </div>

          {filled ? (
            <p className="mt-2 text-[15px] leading-relaxed text-neutral-100 whitespace-pre-wrap">
              {entry.text}
            </p>
          ) : (
            <>
              <p className="mt-2 text-[15px] text-neutral-300">{meta.prompt}</p>
              <p className="mt-2 text-xs text-neutral-500">tap to log</p>
            </>
          )}
        </div>
      </div>
    </button>
  )
}
