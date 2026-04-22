'use client'

import Color from 'colorjs.io'
import {memo, useCallback, useEffect, useRef, useState} from 'react'

import {analyzeSwatch} from '@/lib/neutral-engine/heuristics'
import type {GlobalSwatch, SystemToken, WorkbenchSelection} from '@/lib/neutral-engine/types'

/** Module-scope anchors — avoids constructing Color.js objects every render. */
const CANVAS_WHITE = new Color('white')
const CANVAS_BLACK = new Color('black')

const INSPECTOR_EXIT_MS = 200

type Props = {
  selection: WorkbenchSelection | null
  global: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
  /** Clears selection when the user closes the global swatch inspector. */
  onDismissGlobal?: () => void
}

function inspectorAreEqual(prev: Props, next: Props): boolean {
  if (prev.global !== next.global) return false
  if (prev.onDismissGlobal !== next.onDismissGlobal) return false
  const a = prev.selection
  const b = next.selection
  if (a === b) {
    if (a?.kind === 'system') {
      return prev.lightTokens === next.lightTokens && prev.darkTokens === next.darkTokens
    }
    return true
  }
  if (!a || !b) return false
  if (a.kind !== b.kind) return false
  if (a.kind === 'global' && b.kind === 'global') return a.index === b.index
  if (a.kind === 'system' && b.kind === 'system') {
    return (
      a.id === b.id &&
      a.theme === b.theme &&
      prev.lightTokens === next.lightTokens &&
      prev.darkTokens === next.darkTokens
    )
  }
  return false
}

type GlobalSwatchInspectorProps = {
  global: GlobalSwatch[]
  index: number
  onDismiss: () => void
}

function GlobalSwatchInspector({global, index, onDismiss}: GlobalSwatchInspectorProps) {
  const white = CANVAS_WHITE
  const black = CANVAS_BLACK
  const [exiting, setExiting] = useState(false)
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (exitTimerRef.current) clearTimeout(exitTimerRef.current)
    }
  }, [])

  const handleClose = useCallback(() => {
    if (exiting) return
    setExiting(true)
    exitTimerRef.current = setTimeout(() => {
      onDismiss()
      exitTimerRef.current = null
    }, INSPECTOR_EXIT_MS)
  }, [exiting, onDismiss])

  const n = global.length
  if (n === 0) return null
  const idx = Math.min(index, n - 1)
  const s = global[idx]
  if (!s) return null
  const next = global[idx + 1]
  const advice = analyzeSwatch(s, next, white, black)
  const onWhite = s.color.contrastWCAG21(white)
  const onBlack = s.color.contrastWCAG21(black)

  return (
    <div
      id="global-swatch-inspector"
      role="region"
      aria-label="Global swatch inspector"
      className={`ns-panel space-y-4 rounded-sm border p-4 ${
        exiting
          ? 'pointer-events-none translate-y-0.5 scale-[0.995] opacity-0 transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]'
          : 'animate-inspector-enter'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">Global swatch</p>
        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 rounded-lg border border-[var(--ns-hairline)] bg-[var(--ns-chip)] px-2.5 py-1 text-[0.65rem] font-medium text-[var(--ns-text-muted)] transition-colors hover:bg-[var(--ns-hairline)] hover:text-[var(--ns-text)]"
          aria-label="Close global swatch inspector"
        >
          Close
        </button>
      </div>
      <div
        className="h-20 w-full rounded-xl border border-[var(--ns-hairline)]"
        style={{backgroundColor: s.serialized.hex}}
      />
      <dl className="grid grid-cols-1 gap-2 font-mono text-[0.65rem] text-[var(--ns-text)] lg:grid-cols-2">
        <div>
          <dt className="text-[var(--ns-text-muted)]">Label</dt>
          <dd>{s.label}</dd>
        </div>
        <div>
          <dt className="text-[var(--ns-text-muted)]">Index</dt>
          <dd>
            {s.index} / {global.length - 1}
          </dd>
        </div>
        <div>
          <dt className="text-[var(--ns-text-muted)]">OKLCH</dt>
          <dd className="break-all">{s.serialized.oklchCss}</dd>
        </div>
        <div>
          <dt className="text-[var(--ns-text-muted)]">HEX</dt>
          <dd>{s.serialized.hex}</dd>
        </div>
        <div>
          <dt className="text-[var(--ns-text-muted)]">RGB</dt>
          <dd className="break-all">{s.serialized.rgbCss}</dd>
        </div>
        <div>
          <dt className="text-[var(--ns-text-muted)]">ΔE_OK → next</dt>
          <dd>{advice.deltaEOK != null ? advice.deltaEOK.toFixed(4) : '—'}</dd>
        </div>
        <div>
          <dt className="text-[var(--ns-text-muted)]">Contrast vs white</dt>
          <dd>
            {onWhite.toFixed(2)} ({advice.wcagOnWhite})
          </dd>
        </div>
        <div>
          <dt className="text-[var(--ns-text-muted)]">Contrast vs black</dt>
          <dd>
            {onBlack.toFixed(2)} ({advice.wcagOnBlack})
          </dd>
        </div>
        {advice.tooCloseToNext ? (
          <p className="text-[var(--ns-chrome-amber-text)]">Steps may be too close for distinct UI roles.</p>
        ) : null}
        {advice.hint ? <p className="text-[var(--ns-text-muted)]">{advice.hint}</p> : null}
      </dl>
    </div>
  )
}

function InspectorInner({selection, global, lightTokens, darkTokens, onDismissGlobal}: Props) {
  const white = CANVAS_WHITE
  const black = CANVAS_BLACK

  if (!selection) {
    return (
      <div className="ns-panel rounded-sm border px-4 py-3">
        <p className="eyebrow">Inspector</p>
        <p className="mt-2 text-sm text-[var(--ns-text-muted)]">Select a swatch or system token from the canvas.</p>
      </div>
    )
  }

  if (selection.kind === 'global') {
    const dismiss = onDismissGlobal ?? (() => {})
    return (
      <GlobalSwatchInspector
        key={selection.index}
        global={global}
        index={selection.index}
        onDismiss={dismiss}
      />
    )
  }

  const preferDark = selection.theme === 'darkElevated'
  const token = preferDark
    ? darkTokens.find((t) => t.id === selection.id) ?? lightTokens.find((t) => t.id === selection.id)
    : lightTokens.find((t) => t.id === selection.id) ?? darkTokens.find((t) => t.id === selection.id)
  if (!token) return null

  const bg = token.theme === 'light' ? white : black
  const cr = token.color.contrastWCAG21(bg)

  return (
    <div className="ns-panel group/ins space-y-3 rounded-md border p-4">
      <p className="eyebrow">System token</p>
      <div
        className="h-16 w-full rounded-xl border border-[var(--ns-hairline)]"
        style={{backgroundColor: token.serialized.hex}}
      />
      <p className="font-mono text-[0.7rem] text-[var(--ns-text)]">{token.role}</p>
      <p className="text-[0.65rem] text-[var(--ns-text-muted)]">Hover the card for OKLCH, index, and contrast.</p>
      <div className="max-h-0 overflow-hidden opacity-0 transition-all duration-200 ease-out group-hover/ins:max-h-[28rem] group-hover/ins:opacity-100">
        <dl className="space-y-2 border-t border-[var(--ns-hairline)] pt-3 font-mono text-[0.65rem] text-[var(--ns-text)]">
          <div>
            <dt className="text-[var(--ns-text-muted)]">Name</dt>
            <dd>{token.name}</dd>
          </div>
          <div>
            <dt className="text-[var(--ns-text-muted)]">Theme</dt>
            <dd>{token.theme}</dd>
          </div>
          <div>
            <dt className="text-[var(--ns-text-muted)]">Source global index</dt>
            <dd>{token.sourceGlobalIndex}</dd>
          </div>
          {token.alpha != null ? (
            <div>
              <dt className="text-[var(--ns-text-muted)]">Alpha</dt>
              <dd>{token.alpha}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-[var(--ns-text-muted)]">OKLCH</dt>
            <dd className="break-all">{token.serialized.oklchCss}</dd>
          </div>
          <div>
            <dt className="text-[var(--ns-text-muted)]">HEX</dt>
            <dd>{token.serialized.hex}</dd>
          </div>
          <div>
            <dt className="text-[var(--ns-text-muted)]">Contrast vs {token.theme === 'light' ? 'white' : 'black'}</dt>
            <dd>{cr.toFixed(2)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export const Inspector = memo(InspectorInner, inspectorAreEqual)
