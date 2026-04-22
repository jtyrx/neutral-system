'use client'

import {useEffect, useRef, useSyncExternalStore} from 'react'
import {createPortal} from 'react-dom'

const ELLIPSIS_FRAMES = ['...', '.. ', '.  '] as const
const ELLIPSIS_MS = 220

/**
 * Ellipsis loop **without React state** for the frame index.
 *
 * **Root cause of the prior failure:** `setInterval` + `setFrame()` re-rendered through React.
 * That path is fragile with (1) Strict Mode’s effect mount/cleanup/remount clearing timers before
 * the first tick, (2) rapid `busy` toggles unmounting the toast and killing intervals, and (3)
 * concurrent rendering batching updates so the UI can appear stuck on `...`.
 *
 * **Fix:** drive the visible glyphs with `textContent` on a ref inside a single `setInterval`.
 * No per-tick re-renders — the spinner (`animate-spin`) and overlay stay mounted from the parent;
 * only the text node updates, so the loop cannot stall from React’s render lifecycle.
 */
function LoopingEllipsis() {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = ref.current
    if (node) node.textContent = ELLIPSIS_FRAMES[0]

    let frame = 0
    const id = window.setInterval(() => {
      frame = (frame + 1) % ELLIPSIS_FRAMES.length
      const el = ref.current
      if (el) el.textContent = ELLIPSIS_FRAMES[frame]
    }, ELLIPSIS_MS)

    return () => window.clearInterval(id)
  }, [])

  return (
    <span
      ref={ref}
      className="inline-block min-w-[3ch] whitespace-pre font-mono text-[var(--ns-text)]"
      aria-hidden
    >
      {ELLIPSIS_FRAMES[0]}
    </span>
  )
}

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}

type Props = {
  busy: boolean
  /** Human-readable control name (no trailing ellipsis). */
  label: string
}

/**
 * Full-viewport subtle dark scrim + centered status card while deferred mapping / transitions run.
 */
export function WorkbenchLoadingToast({busy, label}: Props) {
  const isClient = useIsClient()

  useEffect(() => {
    if (!isClient || typeof document === 'undefined') return
    if (busy) {
      const prev = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = prev
      }
    }
    return undefined
  }, [busy, isClient])

  if (!isClient || !busy) {
    return null
  }

  return createPortal(
    <div
      className="pointer-events-auto fixed inset-0 z-[10000] flex items-center justify-center bg-[var(--ns-surface-raised)] p-4 backdrop-blur-[1px]"
      role="presentation"
    >
      <div
        className="flex max-w-[min(28rem,calc(100vw-2rem))] items-center gap-4 rounded-2xl border border-[var(--ns-hairline-strong)] bg-[var(--ns-surface-raised)] px-6 py-4 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)] backdrop-blur-md supports-[backdrop-filter]:bg-[var(--ns-surface-raised)]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          className="size-7 shrink-0 animate-spin rounded-full border-2 border-[var(--ns-hairline-strong)] border-t-white"
          aria-hidden
        />
        <p className="text-base font-medium leading-snug tracking-tight text-[var(--ns-text)]">
          <span>{label}</span>
          <LoopingEllipsis key={label} />
        </p>
      </div>
    </div>,
    document.body,
  )
}
