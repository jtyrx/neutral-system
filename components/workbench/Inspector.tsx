'use client'

import Color from 'colorjs.io'
import {memo} from 'react'

import {analyzeSwatch} from '@/lib/neutral-engine/heuristics'
import type {GlobalSwatch, SystemToken} from '@/lib/neutral-engine/types'
import type {WorkbenchSelection} from '@/lib/neutral-engine/types'

/** Module-scope anchors — avoids constructing Color.js objects every render. */
const CANVAS_WHITE = new Color('white')
const CANVAS_BLACK = new Color('black')

type Props = {
  selection: WorkbenchSelection | null
  global: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
}

function inspectorAreEqual(prev: Props, next: Props): boolean {
  if (prev.global !== next.global) return false
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
      prev.lightTokens === next.lightTokens &&
      prev.darkTokens === next.darkTokens
    )
  }
  return false
}

function InspectorInner({selection, global, lightTokens, darkTokens}: Props) {
  const white = CANVAS_WHITE
  const black = CANVAS_BLACK

  if (!selection) {
    return (
      <div className="ns-panel rounded-2xl border p-4">
        <p className="eyebrow">Inspector</p>
        <p className="mt-2 text-sm text-white/50">Select a swatch or system token from the canvas.</p>
      </div>
    )
  }

  if (selection.kind === 'global') {
    const n = global.length
    if (n === 0) return null
    const idx = Math.min(selection.index, n - 1)
    const s = global[idx]
    if (!s) return null
    const next = global[idx + 1]
    const advice = analyzeSwatch(s, next, white, black)
    const onWhite = s.color.contrastWCAG21(white)
    const onBlack = s.color.contrastWCAG21(black)

    return (
      <div className="ns-panel space-y-4 rounded-2xl border p-4">
        <p className="eyebrow">Global swatch</p>
        <div
          className="h-20 w-full rounded-xl border border-white/10"
          style={{backgroundColor: s.serialized.hex}}
        />
        <dl className="space-y-2 font-mono text-[0.65rem] text-white/80">
          <div>
            <dt className="text-white/45">Label</dt>
            <dd>{s.label}</dd>
          </div>
          <div>
            <dt className="text-white/45">Index</dt>
            <dd>
              {s.index} / {global.length - 1}
            </dd>
          </div>
          <div>
            <dt className="text-white/45">OKLCH</dt>
            <dd className="break-all">{s.serialized.oklchCss}</dd>
          </div>
          <div>
            <dt className="text-white/45">HEX</dt>
            <dd>{s.serialized.hex}</dd>
          </div>
          <div>
            <dt className="text-white/45">RGB</dt>
            <dd className="break-all">{s.serialized.rgbCss}</dd>
          </div>
          <div>
            <dt className="text-white/45">ΔE_OK → next</dt>
            <dd>{advice.deltaEOK != null ? advice.deltaEOK.toFixed(4) : '—'}</dd>
          </div>
          <div>
            <dt className="text-white/45">Contrast vs white</dt>
            <dd>
              {onWhite.toFixed(2)} ({advice.wcagOnWhite})
            </dd>
          </div>
          <div>
            <dt className="text-white/45">Contrast vs black</dt>
            <dd>
              {onBlack.toFixed(2)} ({advice.wcagOnBlack})
            </dd>
          </div>
          {advice.tooCloseToNext ? (
            <p className="text-amber-200/90">Steps may be too close for distinct UI roles.</p>
          ) : null}
          {advice.hint ? <p className="text-white/55">{advice.hint}</p> : null}
        </dl>
      </div>
    )
  }

  const token =
    lightTokens.find((t) => t.id === selection.id) ??
    darkTokens.find((t) => t.id === selection.id)
  if (!token) return null

  const bg = token.theme === 'light' ? white : black
  const cr = token.color.contrastWCAG21(bg)

  return (
    <div className="ns-panel space-y-4 rounded-2xl border p-4">
      <p className="eyebrow">System token</p>
      <div
        className="h-16 w-full rounded-xl border border-white/10"
        style={{backgroundColor: token.serialized.hex}}
      />
      <dl className="space-y-2 font-mono text-[0.65rem] text-white/80">
        <div>
          <dt className="text-white/45">Name</dt>
          <dd>{token.name}</dd>
        </div>
        <div>
          <dt className="text-white/45">Role</dt>
          <dd>{token.role}</dd>
        </div>
        <div>
          <dt className="text-white/45">Theme</dt>
          <dd>{token.theme}</dd>
        </div>
        <div>
          <dt className="text-white/45">Source global index</dt>
          <dd>{token.sourceGlobalIndex}</dd>
        </div>
        {token.alpha != null ? (
          <div>
            <dt className="text-white/45">Alpha</dt>
            <dd>{token.alpha}</dd>
          </div>
        ) : null}
        <div>
          <dt className="text-white/45">OKLCH</dt>
          <dd className="break-all">{token.serialized.oklchCss}</dd>
        </div>
        <div>
          <dt className="text-white/45">HEX</dt>
          <dd>{token.serialized.hex}</dd>
        </div>
        <div>
          <dt className="text-white/45">Contrast vs {token.theme === 'light' ? 'white' : 'black'}</dt>
          <dd>{cr.toFixed(2)}</dd>
        </div>
      </dl>
    </div>
  )
}

export const Inspector = memo(InspectorInner, inspectorAreEqual)
