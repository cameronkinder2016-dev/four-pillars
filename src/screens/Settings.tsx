import { useState } from 'react'
import type { Entry } from '../lib/types'
import { PILLAR_META, PILLAR_ORDER } from '../lib/pillars'
import { deleteAllEntries, fetchAllEntries } from '../lib/entries'
import { formatPrettyDate, getDayKey, shiftDayKey } from '../lib/day'
import { clearQueue } from '../lib/queue'

interface Props {
  onAfterReset: () => void
}

export function SettingsScreen({ onAfterReset }: Props) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [confirmText, setConfirmText] = useState('')

  const withStatus = async (label: string, fn: () => Promise<void>) => {
    setBusy(true)
    setStatus(`${label}…`)
    try {
      await fn()
      setStatus(`${label} ✓`)
      setTimeout(() => setStatus(null), 2000)
    } catch (e) {
      setStatus(`${label} failed: ${(e as Error).message}`)
    } finally {
      setBusy(false)
    }
  }

  const exportJson = () =>
    withStatus('Exporting JSON', async () => {
      const all = await fetchAllEntries()
      const blob = new Blob([JSON.stringify(all, null, 2)], {
        type: 'application/json',
      })
      triggerDownload(blob, `four-pillars-${getDayKey()}.json`)
    })

  const exportMarkdown = () =>
    withStatus('Exporting Markdown', async () => {
      const all = await fetchAllEntries()
      const today = getDayKey()
      const cutoff = shiftDayKey(today, -29)
      const recent = all.filter((e) => e.date >= cutoff)
      const md = buildMarkdown(recent)
      const blob = new Blob([md], { type: 'text/markdown' })
      triggerDownload(blob, `four-pillars-last-30-days-${today}.md`)
    })

  const doReset = () =>
    withStatus('Resetting', async () => {
      await deleteAllEntries()
      clearQueue()
      setConfirming(false)
      setConfirmText('')
      onAfterReset()
    })

  return (
    <div className="px-5 pt-6 pb-28">
      <h1 className="text-xl font-medium text-neutral-100 mb-6">Settings</h1>

      <section className="space-y-3">
        <SettingsButton
          title="Export all data (JSON)"
          subtitle="Every entry ever saved, as a JSON file."
          disabled={busy}
          onClick={exportJson}
        />
        <SettingsButton
          title="Export last 30 days (Markdown)"
          subtitle="Formatted for sharing with Claude or other reviewers."
          disabled={busy}
          onClick={exportMarkdown}
        />
      </section>

      <section className="mt-10">
        <h2 className="text-xs uppercase tracking-widest text-neutral-500 mb-3">
          Danger zone
        </h2>
        {!confirming ? (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            disabled={busy}
            className="w-full min-h-[60px] rounded-xl border border-red-900/60 bg-red-950/30 text-red-300 text-sm font-medium active:scale-[0.99] transition-all disabled:opacity-50"
          >
            Reset all data
          </button>
        ) : (
          <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-4 space-y-3">
            <p className="text-sm text-red-200">
              This permanently deletes every entry. Type <code className="px-1 py-0.5 rounded bg-black/40">DELETE</code> to confirm.
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="w-full bg-black/50 border border-red-900/60 rounded-lg px-3 py-2 text-neutral-100 focus:outline-none focus:border-red-500"
              placeholder="DELETE"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirming(false)
                  setConfirmText('')
                }}
                className="flex-1 min-h-[44px] rounded-lg bg-neutral-800 text-neutral-200 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={doReset}
                disabled={confirmText !== 'DELETE' || busy}
                className="flex-1 min-h-[44px] rounded-lg bg-red-600 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </section>

      {status && (
        <p className="mt-6 text-sm text-neutral-400" role="status">
          {status}
        </p>
      )}
    </div>
  )
}

function SettingsButton({
  title,
  subtitle,
  onClick,
  disabled,
}: {
  title: string
  subtitle: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full text-left min-h-[60px] rounded-xl border border-neutral-800 bg-neutral-900/70 px-4 py-3 active:scale-[0.99] transition-all disabled:opacity-50"
    >
      <div className="font-medium text-neutral-100">{title}</div>
      <div className="text-xs text-neutral-500 mt-0.5">{subtitle}</div>
    </button>
  )
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

function buildMarkdown(entries: Entry[]): string {
  // Group by date, newest first.
  const byDate = new Map<string, Entry[]>()
  for (const e of entries) {
    const list = byDate.get(e.date) ?? []
    list.push(e)
    byDate.set(e.date, list)
  }
  const dates = Array.from(byDate.keys()).sort().reverse()
  const parts: string[] = [`# Four Pillars — last 30 days\n`]
  for (const d of dates) {
    parts.push(`## ${formatPrettyDate(d)}\n`)
    const list = byDate.get(d) ?? []
    for (const p of PILLAR_ORDER) {
      const e = list.find((x) => x.pillar === p)
      const meta = PILLAR_META[p]
      if (e) {
        parts.push(`- **${meta.emoji} ${meta.label}**${e.entry_time ? ` (${e.entry_time})` : ''}: ${e.text}`)
      } else {
        parts.push(`- **${meta.emoji} ${meta.label}**: _not logged_`)
      }
    }
    parts.push('')
  }
  return parts.join('\n')
}
