'use client'

import {memo} from 'react'

import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'

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

/**
 * Full global ramp in index order; swatches that host semantic tokens show role chips.
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
        No swatches — adjust global scale steps.
      </div>
    )
  }

  const cols = twoRowGridColumnCount(len)

  return (
    <div className="space-y-2">
      <p className="text-[0.65rem] font-medium tracking-wide text-white/55">{caption}</p>
      <div
        className={`overflow-x-auto rounded-xl border border-white/10 bg-black/25 p-2 ${accentClassName ?? ''}`}
      >
        <div
          className="grid min-h-[3.25rem] gap-x-px gap-y-1"
          style={{gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`}}
        >
          {Array.from({length: len}, (_, displayOrder) => {
            const i = invertDisplay ? len - 1 - displayOrder : displayOrder
            const s = global[i]!
            const mapped = rolesByIndex.get(s.index) ?? []
            return (
              <div
                key={s.index}
                className="flex min-w-0 flex-col items-stretch"
                title={`${s.label} · idx ${s.index}`}
              >
                <div
                  className="min-h-[2.25rem] flex-1 rounded-t border border-white/10"
                  style={{backgroundColor: s.serialized.hex}}
                />
                <div className="flex max-h-14 flex-wrap justify-center gap-px overflow-hidden py-0.5">
                  {mapped.slice(0, 3).map((t) => (
                    <span
                      key={t.id}
                      className="max-w-full truncate rounded px-0.5 font-mono text-[0.5rem] leading-none text-white/70 ring-1 ring-white/15"
                      title={`${t.name} (${t.role})`}
                    >
                      {t.role.slice(0, 3)}
                    </span>
                  ))}
                  {mapped.length > 3 ? (
                    <span className="font-mono text-[0.5rem] text-white/40">+{mapped.length - 3}</span>
                  ) : null}
                </div>
                <span className="text-center font-mono text-[0.5rem] leading-none text-white/35">
                  {s.index}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export const GlobalScaleStrip = memo(GlobalScaleStripInner)
