/**
 * Preset / scale debug instrumentation.
 *
 * All functions are no-ops unless `presetDebugEnabled()` is true (opt-in via `?presetDebug=1`,
 * `localStorage.setItem('ns:presetDebug', '1')`, or `window.__NS_PRESET_DEBUG__ = true`).
 *
 * Disabling / removal:
 * - To disable at runtime: `localStorage.removeItem('ns:presetDebug')` + drop the query param.
 * - To remove entirely: delete this file and any imports of it (a single grep for `presetDebug`
 *   covers every call site).
 *
 * Conventions:
 * - `PresetKind` = `'variant'` (Hue/Chroma preset buttons) | `'scale'` (Scale-section controls).
 * - Call `logPresetGroup(kind, label, changed)` at the handler entry.
 * - Call `beginTimer(label)` at handler entry and `endTimer(label)` from a downstream effect
 *   (typically the `[lightTokens, darkTokens]` effect that marks derivation complete).
 * - `bumpBuildGlobalScaleCalls(at)` is called from inside `buildGlobalScale` to count fan-out
 *   (rail + main ramp + cache misses).
 */
export type PresetKind = 'variant' | 'scale'

export type LastPreset = {
  kind: PresetKind
  /** Human-readable label for this interaction (preset name or scale control name). */
  label: string
  /** `performance.now()` at handler entry — used as a stable id for counters and timers. */
  at: number
  /** The setGlobalConfig call that was scheduled for this interaction. */
  setGlobalConfigLabel?: string
  setGlobalConfigAt?: number
  /** Guard so `console.timeEnd` is only called once per interaction. */
  timerEnded?: boolean
  /** Snapshot of the before/after fields that actually changed. */
  changed?: unknown
}

export type PresetCountsEntry = {
  buildGlobalScaleCalls: number
}

type PresetDebugWindow = Window & {
  __NS_PRESET_DEBUG__?: boolean
  __NS_LAST_PRESET__?: LastPreset
  __NS_PRESET_COUNTS__?: Record<string, PresetCountsEntry>
}

function w(): PresetDebugWindow | null {
  return typeof window === 'undefined' ? null : (window as PresetDebugWindow)
}

export function presetDebugEnabled(): boolean {
  const win = w()
  if (!win) return false
  try {
    if (new URLSearchParams(win.location.search).get('presetDebug') === '1') return true
  } catch {
    // ignore
  }
  if (win.__NS_PRESET_DEBUG__ === true) return true
  try {
    return win.localStorage.getItem('ns:presetDebug') === '1'
  } catch {
    return false
  }
}

export function getLastPreset(): LastPreset | undefined {
  const win = w()
  if (!win) return undefined
  return win.__NS_LAST_PRESET__
}

export function setLastPreset(next: LastPreset): void {
  const win = w()
  if (!win) return
  win.__NS_LAST_PRESET__ = next
}

export function bumpBuildGlobalScaleCalls(presetAt: number): void {
  const win = w()
  if (!win) return
  const store = (win.__NS_PRESET_COUNTS__ ??= {})
  const key = String(presetAt)
  const entry = (store[key] ??= {buildGlobalScaleCalls: 0})
  entry.buildGlobalScaleCalls++
}

export function getPresetCounts(presetAt: number): PresetCountsEntry | undefined {
  const win = w()
  if (!win) return undefined
  return win.__NS_PRESET_COUNTS__?.[String(presetAt)]
}

/**
 * Human-readable grouped log for a preset/scale interaction. Readable + collapsible;
 * safe to call frequently since it no-ops unless debug is enabled.
 */
export function logPresetGroup(kind: PresetKind, label: string, changed: unknown): number {
  if (!presetDebugEnabled()) return 0
  const at = typeof performance !== 'undefined' ? performance.now() : 0
  setLastPreset({kind, label, at, changed})
  const tag = kind === 'variant' ? 'HuePreset / ChromaPreset' : 'ScaleControl'
  try {
    console.groupCollapsed(`${tag} · ${label}`)
    console.log('Update', JSON.stringify({kind, label, changed}))
    console.log('Perf', JSON.stringify({t0: at}))
    console.groupEnd()
  } catch {
    // ignore
  }
  return at
}

/** Start an end-to-end timer for an interaction. Safe no-op without debug. */
export function beginTimer(label: string): void {
  if (!presetDebugEnabled()) return
  try {
    console.time(`PresetUpdate · setGlobalConfig · ${label}`)
  } catch {
    // ignore
  }
}

/**
 * End the timer started by `beginTimer`. Guards against React re-renders / strict-mode
 * double-invocation by flipping `timerEnded` on `LastPreset` so the second call is a no-op.
 * Should be called from a downstream effect that signals "derivation complete" (i.e. the
 * `[lightTokens, darkTokens]` effect in `useNeutralWorkbench`).
 */
export function endTimerOnce(): void {
  if (!presetDebugEnabled()) return
  const last = getLastPreset()
  if (!last || last.timerEnded === true) return
  const label = last.setGlobalConfigLabel ?? last.label ?? 'preset'
  setLastPreset({...last, timerEnded: true})
  try {
    console.timeEnd(`PresetUpdate · setGlobalConfig · ${label}`)
  } catch {
    // ignore
  }
}
