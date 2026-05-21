import {cva} from 'class-variance-authority'

import {cn} from '@/lib/cn'
import {tier1NeutralCssVarName} from '@/lib/neutral-engine/chromeAliases'
import type {Tier1NeutralExportMode} from '@/lib/neutral-engine/chromeAliases'
import {oklchCoordsFromSerialized} from '@/lib/neutral-engine/serialize'
import type {GlobalSwatch} from '@/lib/neutral-engine'
import type {NeutralTableThemeContext} from '@/components/preview/NeutralScaleReferenceTable'

const rowVariants = cva('border-b border-hairline transition-colors', {
  variants: {
    state: {
      used: 'bg-(--color-border-focus)/8 text-default',
      unused: 'bg-raised text-disabled opacity-[0.72]',
    },
  },
})

const cellVariants = cva('px-8 py-6 font-mono text-nano tabular-nums', {
  variants: {
    state: {
      used: 'text-muted',
      unused: 'text-disabled',
    },
  },
})

const labelCellVariants = cva('px-8 py-6 font-mono', {
  variants: {
    state: {
      used: 'text-default',
      unused: 'text-disabled',
    },
  },
})

const swatchVariants = cva('inline-block h-20 w-40 shrink-0 rounded border', {
  variants: {
    state: {
      used: 'border-hairline-strong',
      unused: 'border-hairline opacity-70',
    },
  },
})

const hexCellVariants = cva('px-8 py-6 font-mono text-nano', {
  variants: {
    state: {
      used: 'text-subtle',
      unused: 'text-disabled',
    },
  },
})

type Props = {
  global: GlobalSwatch[]
  usedIndices: ReadonlySet<number>
  tier1ExportMode?: Tier1NeutralExportMode | undefined
  themeContext?: NeutralTableThemeContext | undefined
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

function UsageBadge({used}: {used: boolean}) {
  if (used) {
    return (
      <span className="inline-block rounded-full bg-(--color-border-focus)/20 px-8 py-2 text-nano font-semibold uppercase tracking-wide text-default">
        Used
      </span>
    )
  }
  return (
    <span className="inline-block rounded-full border border-hairline bg-raised px-8 py-2 text-nano font-medium uppercase tracking-wide text-disabled">
      Unused
    </span>
  )
}

type RowProps = {
  swatch: GlobalSwatch
  used: boolean
  displayIndex: number
  displayLabel: string
  exportKey: string
}

function NeutralScaleUsageRow({swatch: s, used, displayIndex, displayLabel, exportKey}: RowProps) {
  const state = used ? 'used' : 'unused'
  return (
    <tr className={rowVariants({state})}>
      <td className="px-8 py-6 align-middle">
        <UsageBadge used={used} />
      </td>
      <td className={cellVariants({state})}>
        {displayIndex}
      </td>
      <td className={labelCellVariants({state})}>
        {displayLabel}
      </td>
      <td className={cn(cellVariants({state}), 'text-right')}>
        {oklchL(s).toFixed(4)}
      </td>
      <td className="px-8 py-6">
        <span
          className={swatchVariants({state})}
          style={{backgroundColor: s.serialized.hex}}
          title={s.serialized.oklchCss}
        />
      </td>
      <td className={hexCellVariants({state})}>
        {s.serialized.hex}
      </td>
      <td className={cn('max-w-224 truncate px-8 py-6 font-mono text-nano', cellVariants({state}))}>
        {s.serialized.oklchCss}
      </td>
      <td className={cn('px-8 py-6 font-mono text-nano', cellVariants({state}))}>
        {exportKey}
      </td>
    </tr>
  )
}

export function NeutralScaleUsageTable({
  global,
  usedIndices,
  tier1ExportMode,
  themeContext = 'both',
  embedded = false,
  className,
}: Props) {
  const isDarkAdvanced =
    tier1ExportMode?.architecture === 'advanced' && tier1ExportMode.scale === 'dark'
  const n = global.length

  const rows = isDarkAdvanced
    ? [...global].sort((a, b) => b.index - a.index)
    : [...global].sort((a, b) => a.index - b.index)

  const getDisplayIndex = (s: GlobalSwatch) => (isDarkAdvanced ? n - 1 - s.index : s.index)
  const getDisplayLabel = (s: GlobalSwatch) => String(getDisplayIndex(s))

  if (rows.length === 0) {
    return null
  }

  const outer = embedded ? 'mt-24 space-y-12 border-t border-hairline pt-24' : 'space-y-12'

  return (
    <div className={cn(outer, className)}>
      <div>
        <p className="eyebrow">Scale usage</p>
        <p className="mt-4 text-xs text-muted">
          Full ladder with mapping coverage. <span className="text-ring">Used</span> = at
          least one Light or Dark system token references this global index (same derivation as
          exports). Unused steps stay visible for comparison.
        </p>
      </div>
      <div
        className={`overflow-x-auto rounded-xl border ${frameClass(themeContext)}`}
        role="region"
        aria-label="Neutral scale usage — full ladder with mapped indices highlighted"
      >
        <table className="w-full min-w-lg text-left text-micro">
          <caption className="sr-only">Neutral scale usage — {themeContext} theme</caption>
          <thead className="border-b border-hairline text-muted">
            <tr>
              <th className="px-8 py-6 font-medium">Mapping</th>
              <th className="px-8 py-6 font-medium">Idx</th>
              <th className="px-8 py-6 font-medium">Token label</th>
              <th className="px-8 py-6 text-right font-medium">L</th>
              <th className="px-8 py-6 font-medium">Swatch</th>
              <th className="px-8 py-6 font-medium">Hex</th>
              <th className="min-w-160 px-8 py-6 font-medium">OKLCH</th>
              <th className="px-8 py-6 font-medium">Export key</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <NeutralScaleUsageRow
                key={s.index}
                swatch={s}
                used={usedIndices.has(s.index)}
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
NeutralScaleUsageTable.displayName = 'NeutralScaleUsageTable'
