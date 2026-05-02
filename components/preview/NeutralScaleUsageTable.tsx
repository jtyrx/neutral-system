'use client'

import {memo} from 'react'

import {tier1NeutralCssVarName} from '@/lib/neutral-engine/chromeAliases'
import type {Tier1NeutralExportMode} from '@/lib/neutral-engine/chromeAliases'
import {oklchCoordsFromSerialized} from '@/lib/neutral-engine/serialize'
import type {GlobalSwatch} from '@/lib/neutral-engine'
import type {NeutralTableThemeContext} from '@/components/preview/NeutralScaleReferenceTable'

type Props = {
  global: GlobalSwatch[]
  usedIndices: ReadonlySet<number>
  tier1ExportMode?: Tier1NeutralExportMode
  themeContext?: NeutralTableThemeContext
  embedded?: boolean
}

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

function NeutralScaleUsageTableInner({
  global,
  usedIndices,
  tier1ExportMode,
  themeContext = 'both',
  embedded = false,
}: Props) {
  const isDarkAdvanced =
    tier1ExportMode?.architecture === 'advanced' && tier1ExportMode.scale === 'dark'
  const n = global.length

  const rows = isDarkAdvanced
    ? [...global].sort((a, b) => b.index - a.index)
    : [...global].sort((a, b) => a.index - b.index)

  const displayIdx = (s: GlobalSwatch) => (isDarkAdvanced ? n - 1 - s.index : s.index)
  const displayLabel = (s: GlobalSwatch) => String(displayIdx(s))

  if (rows.length === 0) {
    return null
  }

  const outer = embedded ? 'mt-6 space-y-3 border-t border-hairline pt-6' : 'space-y-3'

  return (
    <div className={outer}>
      <div>
        <p className="eyebrow">Scale usage</p>
        <p className="mt-1 text-xs text-muted">
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
        <table className="w-full min-w-lg text-left text-[0.65rem]">
          <thead className="border-b border-hairline text-muted">
            <tr>
              <th className="px-2 py-1.5 font-medium">Mapping</th>
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
            {rows.map((s) => {
              const used = usedIndices.has(s.index)
              return (
                <tr
                  key={s.index}
                  className={`border-b border-hairline transition-colors ${
                    used
                      ? 'bg-emerald-500/[0.07] text-default'
                      : 'bg-raised text-disabled opacity-[0.72]'
                  }`}
                >
                  <td className="px-2 py-1.5 align-middle">
                    {used ? (
                      <span className="inline-block rounded-full bg-emerald-500/25 px-2 py-0.5 text-[0.55rem] font-semibold uppercase tracking-wide text-emerald-100/95">
                        Used
                      </span>
                    ) : (
                      <span className="inline-block rounded-full border border-hairline bg-raised px-2 py-0.5 text-[0.55rem] font-medium uppercase tracking-wide text-disabled">
                        Unused
                      </span>
                    )}
                  </td>
                  <td
                    className={`px-2 py-1.5 font-mono text-[0.6rem] tabular-nums ${used ? 'text-muted' : 'text-disabled'}`}
                  >
                    {displayIdx(s)}
                  </td>
                  <td className={`px-2 py-1.5 font-mono ${used ? 'text-default' : 'text-disabled'}`}>
                    {displayLabel(s)}
                  </td>
                  <td
                    className={`px-2 py-1.5 text-right font-mono text-[0.6rem] tabular-nums ${used ? 'text-muted' : 'text-disabled'}`}
                  >
                    {oklchL(s).toFixed(4)}
                  </td>
                  <td className="px-2 py-1.5">
                    <span
                      className={`inline-block h-5 w-10 shrink-0 rounded border ${
                        used ? 'border-hairline-strong' : 'border-hairline opacity-70'
                      }`}
                      style={{backgroundColor: s.serialized.hex}}
                      title={s.serialized.oklchCss}
                    />
                  </td>
                  <td
                    className={`px-2 py-1.5 font-mono text-[0.6rem] ${used ? 'text-subtle' : 'text-disabled'}`}
                  >
                    {s.serialized.hex}
                  </td>
                  <td
                    className={`max-w-56 truncate px-2 py-1.5 font-mono text-[0.6rem] ${used ? 'text-muted' : 'text-disabled'}`}
                  >
                    {s.serialized.oklchCss}
                  </td>
                  <td
                    className={`px-2 py-1.5 font-mono text-[0.6rem] ${used ? 'text-muted' : 'text-disabled'}`}
                  >
                    {exportTokenKey(displayLabel(s), tier1ExportMode)}
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
