import { useEffect, useRef, useState } from 'react'
import type { Entry } from '../lib/types'
import type { PillarMeta } from '../lib/pillars'
import { isVoiceSupported, startVoice, type VoiceSession } from '../lib/voice'

interface Props {
  meta: PillarMeta
  existing: Entry | null
  onSave: (text: string) => void | Promise<void>
  onDelete?: () => void | Promise<void>
  onClose: () => void
}

export function EntryModal({ meta, existing, onSave, onDelete, onClose }: Props) {
  const [text, setText] = useState(existing?.text ?? '')
  const [interim, setInterim] = useState('')
  const [listening, setListening] = useState(false)
  const [saving, setSaving] = useState(false)
  const sessionRef = useRef<VoiceSession | null>(null)
  const textRef = useRef<HTMLTextAreaElement>(null)
  const voiceOk = isVoiceSupported()

  // Auto-focus textarea so mobile keyboard pops up immediately.
  useEffect(() => {
    const t = setTimeout(() => textRef.current?.focus(), 50)
    return () => clearTimeout(t)
  }, [])

  // Close with Escape key.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Clean up any live recognition on unmount.
  useEffect(() => {
    return () => sessionRef.current?.stop()
  }, [])

  const toggleMic = () => {
    if (listening) {
      sessionRef.current?.stop()
      return
    }
    setInterim('')
    const session = startVoice({
      onInterim: (t) => setInterim(t),
      onFinal: (t) => {
        setText((prev) => appendWithSpace(prev, t))
        setInterim('')
      },
      onError: () => {
        setListening(false)
        setInterim('')
      },
      onEnd: () => {
        setListening(false)
        setInterim('')
      },
    })
    sessionRef.current = session
    if (session) setListening(true)
  }

  const handleSave = async () => {
    const trimmed = text.trim()
    if (!trimmed || saving) return
    setSaving(true)
    try {
      await onSave(trimmed)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || saving) return
    setSaving(true)
    try {
      await onDelete()
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const displayText = listening && interim ? (text ? text + ' ' : '') + interim : text

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="w-full sm:max-w-md bg-neutral-900 rounded-t-3xl sm:rounded-3xl border border-neutral-800 p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl"
        style={{ borderTopColor: meta.accent, borderTopWidth: 3 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="text-3xl" aria-hidden>
            {meta.emoji}
          </div>
          <div className="flex-1">
            <div
              className="text-xs uppercase tracking-widest"
              style={{ color: meta.accent }}
            >
              {meta.label}
            </div>
            <h2 className="text-lg font-medium text-neutral-100">
              {meta.prompt}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-neutral-500 hover:text-neutral-200 p-2 -m-2"
          >
            ✕
          </button>
        </div>

        <textarea
          ref={textRef}
          value={displayText}
          onChange={(e) => {
            setText(e.target.value)
          }}
          placeholder="Type or tap the mic…"
          rows={5}
          className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 text-base text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-neutral-600 resize-none"
        />

        <div className="mt-4 flex items-center gap-3">
          {voiceOk && (
            <button
              type="button"
              onClick={toggleMic}
              aria-label={listening ? 'Stop listening' : 'Start voice input'}
              className={[
                'min-h-[60px] w-[60px] rounded-full flex items-center justify-center text-2xl',
                'border-2 transition-all',
                listening
                  ? 'bg-red-500/20 border-red-500 animate-pulse'
                  : 'bg-neutral-800 border-neutral-700 active:scale-95',
              ].join(' ')}
            >
              🎙️
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!text.trim() || saving}
            className="flex-1 min-h-[60px] rounded-full font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
            style={{
              backgroundColor: meta.accent,
              color: '#0a0a0a',
            }}
          >
            {saving ? 'Saving…' : existing ? 'Update' : 'Save'}
          </button>
        </div>

        {existing && onDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={saving}
            className="mt-3 w-full min-h-[44px] text-sm text-red-400 hover:text-red-300 disabled:opacity-40"
          >
            Delete entry
          </button>
        )}
      </div>
    </div>
  )
}

function appendWithSpace(prev: string, next: string): string {
  if (!prev) return next
  const needsSpace = !/\s$/.test(prev)
  return prev + (needsSpace ? ' ' : '') + next
}
