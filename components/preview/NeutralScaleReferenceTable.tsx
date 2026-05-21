import {cn} from '@/lib/cn'
import {tier1NeutralCssVarName} from '@/lib/neutral-engine/chromeAliases'
import type {Tier1NeutralExportMode} from '@/lib/neutral-engine/chromeAliases'
import {oklchCoordsFromSerialized} from '@/lib/neutral-engine/serialize'
import type {GlobalSwatch} from '@/lib/neutral-engine'

export type NeutralTableThemeContext = 'light' | 'dark' | 'both'

type Props = {
  global: GlobalSwatch[]
  /** Advanced mode: light sibling uses `--color-neutral-*`; dark sibling uses `--color-neutral-dark-*`. Ignored when simple or omitted. */
  tier1ExportMode?: Tier1NeutralExportMode | undefined
  /** Frame the table with Light (amber) or Dark (sky) preview chrome. */
  themeContext?: NeutralTableThemeContext | undefined
  /** When true, omit top margin / separator (nested in inspector). */
  embedded?: boolean | undefined
  className?: string | undefined
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
      return 'border-(--chrome-amber-border) bg-(--chrome-amber-surface-faint) ring-1 ring-(--chrome-amber-ring-faint)'
    case 'dark':
      return 'border-(--chrome-sky-border) bg-(--chrome-sky-surface-faint) ring-1 ring-(--chrome-sky-ring-faint)'
    default:
      return 'border-hairline bg-raised'
  }
}

function NeutralScaleTableHead() {
  return (
    <thead className="border-b border-hairline text-muted">
      <tr>
        <th className="px-8 py-6 font-medium">Idx</th>
        <th className="px-8 py-6 font-medium">Token label</th>
        <th className="px-8 py-6 text-right font-medium">L</th>
        <th className="px-8 py-6 font-medium">Swatch</th>
        <th className="px-8 py-6 font-medium">Hex</th>
        <th className="min-w-160 px-8 py-6 font-medium">OKLCH</th>
        <th className="px-8 py-6 font-medium">Export key</th>
      </tr>
    </thead>
  )
}

type RowProps = {
  swatch: GlobalSwatch
  displayIndex: number
  displayLabel: string
  exportKey: string
}

function NeutralScaleTableRow({swatch: s, displayIndex, displayLabel, exportKey}: RowProps) {
  return (
    <tr key={s.index} className="border-b border-hairline">
      <td className="px-8 py-6 font-mono text-nano tabular-nums text-disabled">
        {displayIndex}
      </td>
      <td className="px-8 py-6 font-mono text-default">{displayLabel}</td>
      <td className="px-8 py-6 text-right font-mono text-nano tabular-nums text-muted">
        {oklchL(s).toFixed(4)}
      </td>
      <td className="px-8 py-6">
        <span
          className="inline-block h-20 w-40 shrink-0 rounded border border-hairline-strong"
          style={{backgroundColor: s.serialized.hex}}
          title={s.serialized.oklchCss}
        />
      </td>
      <td className="px-8 py-6 font-mono text-nano text-subtle">{s.serialized.hex}</td>
      <td className="max-w-224 truncate px-8 py-6 font-mono text-nano text-muted">
        {s.serialized.oklchCss}
      </td>
      <td className="px-8 py-6 font-mono text-nano text-muted">{exportKey}</td>
    </tr>
  )
}

export function NeutralScaleReferenceTable({global, tier1ExportMode, themeContext = 'both', embedded = false, className}: Props) {
  if (global.length === 0) {
    return null
  }

  const isDarkAdvanced =
    tier1ExportMode?.architecture === 'advanced' && tier1ExportMode.scale === 'dark'
  const n = global.length

  const rows = isDarkAdvanced
    ? [...global].sort((a, b) => b.index - a.index)
    : [...global].sort((a, b) => a.index - b.index)

  const getDisplayIndex = (s: GlobalSwatch) => (isDarkAdvanced ? n - 1 - s.index : s.index)
  const getDisplayLabel = (s: GlobalSwatch) => String(getDisplayIndex(s))

  const outer = embedded ? 'space-y-12' : 'mt-32 space-y-12 border-t border-hairline pt-24'

  return (
    <div className={cn(outer, className)}>
      <div>
        <p className="eyebrow">Full neutral scale</p>
        <p className="mt-4 text-xs text-muted">
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
        <table className="w-full min-w-480 text-left text-micro">
          <caption className="sr-only">Neutral scale reference — {themeContext} theme</caption>
          <NeutralScaleTableHead />
          <tbody>
            {rows.map((s) => (
              <NeutralScaleTableRow
                key={s.index}
                swatch={s}
                displayIndex={getDisplayIndex(s)}
                displayLabel={getDisplayLabel(s)}
                exportKey={exportTokenKey(getDisplayLabel(s), tier1ExportMode)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
NeutralScaleReferenceTable.displayName = 'NeutralScaleReferenceTable'
