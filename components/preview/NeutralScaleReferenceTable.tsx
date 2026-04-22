'use client'

import {memo} from 'react'

import type {GlobalSwatch} from '@/lib/neutral-engine'

export type NeutralTableThemeContext = 'light' | 'dark' | 'both'

type Props = {
  global: GlobalSwatch[]
  /** Frame the table with Light (amber) or Dark (sky) preview chrome. */
  themeContext?: NeutralTableThemeContext
  /** When true, omit top margin / separator (nested in inspector). */
  embedded?: boolean
}

/** Export JSON keys use `neutral-${label}` — aligned with `exportJson` in exportFormats. */
function exportTokenKey(label: string): string {
  return `neutral-${label}`
}

function oklchL(s: GlobalSwatch): number {
  const c = s.color.to('oklch').coords
  return c[0] ?? 0
}

function frameClass(themeContext: NeutralTableThemeContext | undefined): string {
  switch (themeContext) {
    case 'light':
      return 'border-[var(--ns-chrome-amber-border)] bg-[var(--ns-chrome-amber-surface-faint)] ring-1 ring-[var(--ns-chrome-amber-ring-faint)]'
    case 'dark':
      return 'border-[var(--ns-chrome-sky-border)] bg-[var(--ns-chrome-sky-surface-faint)] ring-1 ring-[var(--ns-chrome-sky-ring-faint)]'
    default:
      return 'border-[var(--ns-hairline)] bg-[var(--ns-surface-raised)]'
  }
}

function NeutralScaleReferenceTableInner({global, themeContext = 'both', embedded = false}: Props) {
  if (global.length === 0) {
    return null
  }

  /** Scale index order 0 … n−1 matches buildGlobalScale (lightest → darkest by L). */
  const rows = [...global].sort((a, b) => a.index - b.index)

  const outer = embedded ? 'space-y-3' : 'mt-8 space-y-3 border-t border-[var(--ns-hairline)] pt-6'

  return (
    <div className={outer}>
      <div>
        <p className="eyebrow">Full neutral scale</p>
        <p className="mt-1 text-xs text-[var(--ns-text-muted)]">
          Full ladder by scale index (low → high). OKLCH L decreases stepwise from lightest to
          darkest. Token labels use the active naming convention from Global scale — same source as
          exports.
        </p>
      </div>
      <div
        className={`overflow-x-auto rounded-xl border ${frameClass(themeContext)}`}
        role="region"
        aria-label="Full neutral scale reference"
      >
        <table className="w-full min-w-[30rem] text-left text-[0.65rem]">
          <thead className="border-b border-[var(--ns-hairline)] text-[var(--ns-text-muted)]">
            <tr>
              <th className="px-2 py-1.5 font-medium">Idx</th>
              <th className="px-2 py-1.5 font-medium">Token label</th>
              <th className="px-2 py-1.5 text-right font-medium">L</th>
              <th className="px-2 py-1.5 font-medium">Swatch</th>
              <th className="px-2 py-1.5 font-medium">Hex</th>
              <th className="min-w-[10rem] px-2 py-1.5 font-medium">OKLCH</th>
              <th className="px-2 py-1.5 font-medium">Export key</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.index} className="border-b border-[var(--ns-hairline)]">
                <td className="px-2 py-1.5 font-mono text-[0.6rem] tabular-nums text-[var(--ns-text-faint)]">
                  {s.index}
                </td>
                <td className="px-2 py-1.5 font-mono text-[var(--ns-text)]">{s.label}</td>
                <td className="px-2 py-1.5 text-right font-mono text-[0.6rem] tabular-nums text-[var(--ns-text-muted)]">
                  {oklchL(s).toFixed(4)}
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className="inline-block h-5 w-10 shrink-0 rounded border border-[var(--ns-hairline-strong)]"
                    style={{backgroundColor: s.serialized.hex}}
                    title={s.serialized.oklchCss}
                  />
                </td>
                <td className="px-2 py-1.5 font-mono text-[0.6rem] text-[var(--ns-text-subtle)]">{s.serialized.hex}</td>
                <td className="max-w-[14rem] truncate px-2 py-1.5 font-mono text-[0.6rem] text-[var(--ns-text-muted)]">
                  {s.serialized.oklchCss}
                </td>
                <td className="px-2 py-1.5 font-mono text-[0.6rem] text-[var(--ns-text-muted)]">
                  {exportTokenKey(s.label)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const NeutralScaleReferenceTable = memo(NeutralScaleReferenceTableInner)
