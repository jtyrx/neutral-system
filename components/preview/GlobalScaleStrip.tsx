'use client'

import { memo } from 'react'

import type { GlobalSwatch, SystemToken, TokenView } from '@/lib/neutral-engine'
import {
  BORDER_SLOTS,
  compareSemanticRoles,
  semanticCategory,
  SURFACE_ROLE_SORT_ORDER,
  TEXT_SLOTS,
} from '@/lib/neutral-engine/semanticNaming'
type Props = {
  global: GlobalSwatch[]
  tokenView: TokenView
  /** Shown above the strip (e.g. “Light · global ramp”). */
  caption: string
  /** Accent for focus ring / column chrome. */
  accentClassName?: string
  /**
   * When true, render swatches in reverse index order (presentation only; indices and token lookups unchanged).
   * Used for dark-theme ramps so the visual reads dark→light alongside light-theme light→dark.
   */
  invertDisplay?: boolean
}

/**
 * Column count for exactly two row-major rows: first row is first ⌈n/2⌉ swatches,
 * second row is the remainder (equal halves when n is even).
 */
function twoRowGridColumnCount(length: number): number {
  return length <= 0 ? 1 : Math.ceil(length / 2)
}

const BORDER_ROLE_ORDER = BORDER_SLOTS.map((s) => `border.${s}` as const)
const TEXT_ROLE_ORDER = TEXT_SLOTS.map((s) => `text.${s}` as const)

/** Ladder-ordered S#/B#/T# badges; interactive/emphasis use a neutral dot. */
function stripRoleBadge(role: string): { text: string; className: string } {
  const cat = semanticCategory(role)
  if (cat === 'surface') {
    const i = SURFACE_ROLE_SORT_ORDER.indexOf(role)
    if (i >= 0) return { text: `S${i + 1}`, className: 'bg-emerald-400/90 text-zinc-950' }
    const m = /^surface\.layer-(\d+)$/.exec(role)
    if (m) return { text: `S${Number(m[1]) + 1}`, className: 'bg-emerald-400/90 text-zinc-950' }
    return { text: 'S?', className: 'bg-emerald-400/90 text-zinc-950' }
  }
  if (cat === 'border') {
    const i = BORDER_ROLE_ORDER.findIndex((r) => r === role)
    if (i >= 0) return { text: `B${i + 1}`, className: 'bg-amber-400/90 text-zinc-950' }
    const m = /^border\.layer-(\d+)$/.exec(role)
    if (m) return { text: `B${Number(m[1]) + 1}`, className: 'bg-amber-400/90 text-zinc-950' }
    return { text: 'B?', className: 'bg-amber-400/90 text-zinc-950' }
  }
  if (cat === 'text') {
    const i = TEXT_ROLE_ORDER.findIndex((r) => r === role)
    if (i >= 0) return { text: `T${i + 1}`, className: 'bg-sky-400/90 text-zinc-950' }
    const m = /^text\.layer-(\d+)$/.exec(role)
    if (m) return { text: `T${Number(m[1]) + 1}`, className: 'bg-sky-400/90 text-zinc-950' }
    return { text: 'T?', className: 'bg-sky-400/90 text-zinc-950' }
  }
  return { text: '·', className: 'bg-white/20 text-white/90 ring-1 ring-white/15' }
}

function sortMappedForStrip(tokens: SystemToken[]): SystemToken[] {
  return [...tokens].sort((a, b) => compareSemanticRoles(a.role, b.role))
}

/**
 * Full global ramp in index order; swatches that host semantic tokens show S#/B#/T# ladder badges.
 * Renders as two balanced rows (grid flow) for scanability — same treatment for every theme.
 */
function GlobalScaleStripInner({
  global,
  tokenView,
  caption,
  accentClassName,
  invertDisplay = false,
}: Props) {
  const rolesByIndex = tokenView.byGlobalIndex

  const len = global.length
  if (len === 0) {
    return (
      <div className="rounded-xl border border-dashed border-white/20 p-4 text-center text-xs text-white/45">
        No swatches — check global scale configuration.
      </div>
    )
  }

  const cols = twoRowGridColumnCount(len)

  return (
    <div className="space-y-2">
      <p className="text-[0.65rem] font-medium tracking-wide text-white/55">{caption}</p>
      <div
        className={`w-full overflow-x-auto rounded-xl border border-white/10 bg-black/25 p-2 ${accentClassName ?? ''}`}
      >
        <div
          className="grid w-full min-w-0 gap-x-1 gap-y-1"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: len }, (_, displayOrder) => {
            const i = invertDisplay ? len - 1 - displayOrder : displayOrder
            const s = global[i]!
            const mapped = rolesByIndex.get(s.index) ?? []
            const ordered = sortMappedForStrip(mapped)
            return (
              <div
                key={s.index}
                className="flex min-w-0 flex-col items-stretch font-mono"
                title={`${s.label} · idx ${s.index}`}
              >
                {/* Fixed height: no flex-1 so every swatch matches regardless of badge count */}
                <div
                  className="h-9 w-full shrink-0 rounded-t border border-white/10 lg:h-11"
                  style={{ backgroundColor: s.serialized.hex }}
                />
                <span className="shrink-0 text-center text-[0.5rem] leading-none text-white/35 py-0.5 px-0.5">
                  {s.index}
                </span>
                <div className="flex h-14 shrink-0 flex-col flex-wrap justify-start content-start items-start gap-1 overflow-hidden py-0.5">
                  {ordered.slice(0, 3).map((t) => {
                    const badge = stripRoleBadge(t.role)
                    return (
                      <span
                        key={t.id}
                        className={`inline-flex max-w-full min-w-[1.1rem] justify-center rounded px-0.5 py-0.5 text-[0.5rem] font-semibold leading-none ${badge.className}`}
                        title={`${t.name} (${t.role})`}
                      >
                        {badge.text}
                      </span>
                    )
                  })}
                  {mapped.length > 3 ? (
                    <span className="text-[0.5rem] text-white/40">+{mapped.length - 3}</span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const GlobalScaleStrip = memo(GlobalScaleStripInner)
