'use client'

import {memo} from 'react'

import type {GlobalSwatch} from '@/lib/neutral-engine'
import type {NeutralTableThemeContext} from '@/components/preview/NeutralScaleReferenceTable'

type Props = {
  global: GlobalSwatch[]
  usedIndices: ReadonlySet<number>
  themeContext?: NeutralTableThemeContext
  embedded?: boolean
}

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

function NeutralScaleUsageTableInner({global, usedIndices, themeContext = 'both', embedded = false}: Props) {
  const rows = [...global].sort((a, b) => a.index - b.index)

  if (rows.length === 0) {
    return null
  }

  const outer = embedded ? 'mt-6 space-y-3 border-t border-[var(--ns-hairline)] pt-6' : 'space-y-3'

  return (
    <div className={outer}>
      <div>
        <p className="eyebrow">Scale usage</p>
        <p className="mt-1 text-xs text-[var(--ns-text-muted)]">
          Full ladder with mapping coverage. <span className="text-emerald-200/85">Used</span> = at
          least one Light or Dark system token references this global index (same derivation as
          exports). Unused steps stay visible for comparison.
        </p>
      </div>
      <div
        className={`overflow-x-auto rounded-xl border ${frameClass(themeContext)}`}
        role="region"
        aria-label="Neutral scale usage — full ladder with mapped indices highlighted"
      >
        <table className="w-full min-w-[32rem] text-left text-[0.65rem]">
          <thead className="border-b border-[var(--ns-hairline)] text-[var(--ns-text-muted)]">
            <tr>
              <th className="px-2 py-1.5 font-medium">Mapping</th>
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
            {rows.map((s) => {
              const used = usedIndices.has(s.index)
              return (
                <tr
                  key={s.index}
                  className={`border-b border-[var(--ns-hairline)] transition-colors ${
                    used
                      ? 'bg-emerald-500/[0.07] text-[var(--ns-text)]'
                      : 'bg-[var(--ns-surface-raised)] text-[var(--ns-text-faint)] opacity-[0.72]'
                  }`}
                >
                  <td className="px-2 py-1.5 align-middle">
                    {used ? (
                      <span className="inline-block rounded-full bg-emerald-500/25 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-emerald-100/95">
                        Used
                      </span>
                    ) : (
                      <span className="inline-block rounded-full border border-[var(--ns-hairline)] bg-[var(--ns-surface-raised)] px-2 py-0.5 text-[0.55rem] font-medium uppercase tracking-wide text-[var(--ns-text-faint)]">
                        Unused
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-2 py-1.5 font-mono text-[0.6rem] tabular-nums ${used ? 'text-[var(--ns-text-muted)]' : 'text-[var(--ns-text-faint)]'}`}
                  >
                    {s.index}
                  </td>
                  <td className={`px-2 py-1.5 font-mono ${used ? 'text-[var(--ns-text)]' : 'text-[var(--ns-text-faint)]'}`}>
                    {s.label}
                  </td>
                  <td
                    className={`px-2 py-1.5 text-right font-mono text-[0.6rem] tabular-nums ${used ? 'text-[var(--ns-text-muted)]' : 'text-[var(--ns-text-faint)]'}`}
                  >
                    {oklchL(s).toFixed(4)}
                  </td>
                  <td className="px-2 py-1.5">
                    <span
                      className={`inline-block h-5 w-10 shrink-0 rounded border ${
                        used ? 'border-[var(--ns-hairline-strong)]' : 'border-[var(--ns-hairline)] opacity-70'
                      }`}
                      style={{backgroundColor: s.serialized.hex}}
                      title={s.serialized.oklchCss}
                    />
                  </td>
                  <td
                    className={`px-2 py-1.5 font-mono text-[0.6rem] ${used ? 'text-[var(--ns-text-subtle)]' : 'text-[var(--ns-text-faint)]'}`}
                  >
                    {s.serialized.hex}
                  </td>
                  <td
                    className={`max-w-[14rem] truncate px-2 py-1.5 font-mono text-[0.6rem] ${used ? 'text-[var(--ns-text-muted)]' : 'text-[var(--ns-text-faint)]'}`}
                  >
                    {s.serialized.oklchCss}
                  </td>
                  <td
                    className={`px-2 py-1.5 font-mono text-[0.6rem] ${used ? 'text-[var(--ns-text-muted)]' : 'text-[var(--ns-text-faint)]'}`}
                  >
                    {exportTokenKey(s.label)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const NeutralScaleUsageTable = memo(NeutralScaleUsageTableInner)
