
import {cn} from '@/lib/cn'
import {primitiveNeutralExportName, primitiveSortKey} from '@/components/preview/primitiveTokenTable'
import type {Tier1NeutralExportMode} from '@/lib/neutral-engine/chromeAliases'
import type {GlobalSwatch} from '@/lib/neutral-engine'

type Props = {
  global: GlobalSwatch[]
  /** Global ramp indices referenced by any system token (e.g. from {@link usedGlobalIndicesFromTokenViews}). */
  usedIndices: ReadonlySet<number>
  /** Region label for screen readers. */
  label: string
  /** Advanced Mode: pass dark export mode so primitive names show `--color-neutral-dark-*` with correct display index. */
  tier1ExportMode?: Tier1NeutralExportMode
  className?: string
}

function PrimitiveTableHead() {
  return (
    <thead className="border-b border-hairline font-mono text-muted">
      <tr>
        <th className="px-8 py-6 font-medium">Primitive</th>
        <th className="w-48 px-8 py-6 font-medium">Swatch</th>
        <th className="px-8 py-6 font-medium">Hex</th>
        <th className="min-w-160 px-8 py-6 font-medium">OKLCH</th>
        <th className="px-8 py-6 text-right font-medium">Idx</th>
      </tr>
    </thead>
  )
}

PrimitiveTableHead.displayName = 'PrimitiveTableHead'

type RowProps = {
  primName: string
  displayIndex: number
  hex: string
  oklch: string
}

function PrimitiveTableRow({primName: prim, displayIndex, hex, oklch}: RowProps) {
  const swatchBg = hex.startsWith('#') ? hex : undefined
  return (
    <tr className="border-b border-hairline">
      <td className="px-8 py-6 align-middle">
        <span className="font-medium text-default">{prim}</span>
      </td>
      <td className="px-8 py-6 align-middle">
        <span
          className="inline-block h-36 w-36 shrink-0 rounded border border-hairline-strong shadow-inner"
          style={swatchBg ? {backgroundColor: swatchBg} : undefined}
          title={`${prim} · ${hex}`}
        />
      </td>
      <td className="px-8 py-6 align-middle tabular-nums text-subtle">{hex}</td>
      <td className="max-w-[min(28rem,55vw)] px-8 py-6 align-middle break-all text-subtle">
        {oklch}
      </td>
      <td className="px-8 py-6 text-right align-middle tabular-nums text-muted">{displayIndex}</td>
    </tr>
  )
}

PrimitiveTableRow.displayName = 'PrimitiveTableRow'

/**
 * One row per used `neutral-*` primitive: swatch, name, hex, OKLCH, idx — deduplicated, no semantics.
 * Custom brand is preview-only and intentionally excluded; this table reflects exportable ramp rows.
 */
export function UsedNeutralPrimitivesTable({global, usedIndices, label, tier1ExportMode, className}: Props) {
  const rows = [...usedIndices].filter((i) => i >= 0 && i < global.length)
  rows.sort((a, b) => {
    const ka = primitiveSortKey(global[a])
    const kb = primitiveSortKey(global[b])
    if (ka !== kb) return ka - kb
    const la = global[a]?.label ?? ''
    const lb = global[b]?.label ?? ''
    return la.localeCompare(lb, undefined, {numeric: true})
  })

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-hairline bg-raised px-12 py-8 text-xs text-muted">
        No mapped primitives — adjust system mapping to reference ramp steps.
      </p>
    )
  }

  return (
    <div className={cn('space-y-8', className)}>
      <p className="text-nano leading-snug text-disabled">
        Every global index referenced by light or dark system tokens (including emphasis). Semantic
        layer filter does not apply.
      </p>
      <div className="overflow-x-auto rounded-sm border border-hairline bg-raised" role="region" aria-label={label}>
        <table className="w-full min-w-md text-left text-micro">
          <PrimitiveTableHead />
          <tbody className="font-mono">
            {rows.map((idx) => (
              <PrimitiveTableRow
                key={`used-prim-${idx}`}
                primName={primitiveNeutralExportName(global, idx, tier1ExportMode)}
                displayIndex={idx}
                hex={global[idx]?.serialized.hex ?? '—'}
                oklch={global[idx]?.serialized.oklchCss ?? '—'}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
UsedNeutralPrimitivesTable.displayName = 'UsedNeutralPrimitivesTable'
