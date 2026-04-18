// Thin wrapper over Web Speech API. Safari uses `webkitSpeechRecognition`;
// standards-compliant browsers expose `SpeechRecognition`. If neither
// exists (desktop Firefox, some Androids), the mic button should be hidden.

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult:
    | ((event: {
        resultIndex: number
        results: { 0: { transcript: string }; isFinal: boolean; length: number }[] & {
          length: number
        }
      }) => void)
    | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}

function getCtor(): SpeechRecognitionCtor | null {
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isVoiceSupported(): boolean {
  return getCtor() !== null
}

export interface VoiceSession {
  stop: () => void
}

/**
 * Starts listening. onInterim fires as the user speaks; onFinal fires when
 * the recognizer commits a chunk. onEnd fires when the session ends for
 * any reason (user stop, silence timeout, error).
 */
export function startVoice(cb: {
  onInterim: (text: string) => void
  onFinal: (text: string) => void
  onError: (message: string) => void
  onEnd: () => void
}): VoiceSession | null {
  const Ctor = getCtor()
  if (!Ctor) return null
  const rec = new Ctor()
  rec.lang = navigator.language || 'en-US'
  rec.continuous = true
  rec.interimResults = true

  rec.onresult = (event) => {
    let interim = ''
    let final = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const r = event.results[i]
      if (r.isFinal) final += r[0].transcript
      else interim += r[0].transcript
    }
    if (final) cb.onFinal(final)
    if (interim) cb.onInterim(interim)
  }
  rec.onerror = (e) => cb.onError(e.error)
  rec.onend = () => cb.onEnd()

  try {
    rec.start()
  } catch (e) {
    cb.onError(String(e))
    return null
  }

  return { stop: () => rec.stop() }
}
