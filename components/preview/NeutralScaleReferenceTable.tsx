'use client'

import {memo} from 'react'

import {tier1NeutralCssVarName} from '@/lib/neutral-engine/chromeAliases'
import type {Tier1NeutralExportMode} from '@/lib/neutral-engine/chromeAliases'
import {oklchCoordsFromSerialized} from '@/lib/neutral-engine/serialize'
import type {GlobalSwatch} from '@/lib/neutral-engine'

export type NeutralTableThemeContext = 'light' | 'dark' | 'both'

type Props = {
  global: GlobalSwatch[]
  /** Advanced mode: light sibling uses `--color-neutral-*`; dark sibling uses `--color-neutral-dark-*`. Ignored when simple or omitted. */
  tier1ExportMode?: Tier1NeutralExportMode
  /** Frame the table with Light (amber) or Dark (sky) preview chrome. */
  themeContext?: NeutralTableThemeContext
  /** When true, omit top margin / separator (nested in inspector). */
  embedded?: boolean
}

/** Tier-1 `--color-*` key for the ramp step (matches `exportCssVariables`). */
function exportTokenKey(label: string, mode?: Tier1NeutralExportMode): string {
  if (mode == null || mode.architecture === 'simple') {
    return `--${tier1NeutralCssVarName(label)}`
  }
  return `--${tier1NeutralCssVarName(label, mode)}`
}

function oklchL(s: GlobalSwatch): number {
  return oklchCoordsFromSerialized(s.serialized)[0] ?? 0
}

function frameClass(themeContext: NeutralTableThemeContext | undefined): string {
  switch (themeContext) {
    case 'light':
      return 'border-[var(--chrome-amber-border)] bg-[var(--chrome-amber-surface-faint)] ring-1 ring-[var(--chrome-amber-ring-faint)]'
    case 'dark':
      return 'border-[var(--chrome-sky-border)] bg-[var(--chrome-sky-surface-faint)] ring-1 ring-[var(--chrome-sky-ring-faint)]'
    default:
      return 'border-hairline bg-[var(--ns-surface-raised)]'
  }
}

function NeutralScaleReferenceTableInner({global, tier1ExportMode, themeContext = 'both', embedded = false}: Props) {
  if (global.length === 0) {
    return null
  }

  const isDarkAdvanced =
    tier1ExportMode?.architecture === 'advanced' && tier1ExportMode.scale === 'dark'
  const n = global.length

  /** For dark advanced, rows run darkest → lightest (display index 0 = darkest); otherwise lightest → darkest. */
  const rows = isDarkAdvanced
    ? [...global].sort((a, b) => b.index - a.index)
    : [...global].sort((a, b) => a.index - b.index)

  const displayIdx = (s: GlobalSwatch) => (isDarkAdvanced ? n - 1 - s.index : s.index)
  const displayLabel = (s: GlobalSwatch) => String(displayIdx(s))

  const outer = embedded ? 'space-y-3' : 'mt-8 space-y-3 border-t border-hairline pt-6'

  return (
    <div className={outer}>
      <div>
        <p className="eyebrow">Full neutral scale</p>
        <p className="mt-1 text-xs text-muted">
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
        <table className="w-full min-w-120 text-left text-[0.65rem]">
          <thead className="border-b border-hairline text-muted">
            <tr>
              <th className="px-2 py-1.5 font-medium">Idx</th>
              <th className="px-2 py-1.5 font-medium">Token label</th>
              <th className="px-2 py-1.5 text-right font-medium">L</th>
              <th className="px-2 py-1.5 font-medium">Swatch</th>
              <th className="px-2 py-1.5 font-medium">Hex</th>
              <th className="min-w-40 px-2 py-1.5 font-medium">OKLCH</th>
              <th className="px-2 py-1.5 font-medium">Export key</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.index} className="border-b border-hairline">
                <td className="px-2 py-1.5 font-mono text-[0.6rem] tabular-nums text-disabled">
                  {displayIdx(s)}
                </td>
                <td className="px-2 py-1.5 font-mono text-default">{displayLabel(s)}</td>
                <td className="px-2 py-1.5 text-right font-mono text-[0.6rem] tabular-nums text-muted">
                  {oklchL(s).toFixed(4)}
                </td>
                <td className="px-2 py-1.5">
                  <span
                    className="inline-block h-5 w-10 shrink-0 rounded border border-hairline-strong"
                    style={{backgroundColor: s.serialized.hex}}
                    title={s.serialized.oklchCss}
                  />
                </td>
                <td className="px-2 py-1.5 font-mono text-[0.6rem] text-subtle">{s.serialized.hex}</td>
                <td className="max-w-56 truncate px-2 py-1.5 font-mono text-[0.6rem] text-muted">
                  {s.serialized.oklchCss}
                </td>
                <td className="px-2 py-1.5 font-mono text-[0.6rem] text-muted">
                  {exportTokenKey(displayLabel(s), tier1ExportMode)}
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
