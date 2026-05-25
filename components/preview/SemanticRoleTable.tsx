
import {cn} from '@/lib/cn'
import {
  primitiveNeutralExportName,
  primitiveSortKey,
} from '@/components/preview/primitiveTokenTable'
import type {Tier1NeutralExportMode} from '@/lib/neutral-engine/chromeAliases'
import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'
import {isBrandPairRole, isInversePairRole, isOverflowRole} from '@/lib/neutral-engine/semanticNaming'

/** Filter paired-role tables by semantic layer (dot-path roles). */
export type SemanticLayerFilter = 'all' | 'surface' | 'border' | 'text' | 'interactive' | 'inverse' | 'brand'

function roleMatchesLayerFilter(role: string, filter: SemanticLayerFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'inverse') return isInversePairRole(role)
  if (filter === 'brand') return isBrandPairRole(role)
  if (filter === 'surface') return role.startsWith('surface.') && !isInversePairRole(role) && !isBrandPairRole(role)
  if (filter === 'border') return role.startsWith('border.') && !isBrandPairRole(role)
  if (filter === 'text') return role.startsWith('text.') && !isInversePairRole(role) && !isBrandPairRole(role)
  if (filter === 'interactive') {
    return role.startsWith('state.') || role.startsWith('overlay.')
  }
  return true
}

type Props = {
  tokenView: TokenView
  global: GlobalSwatch[]
  /** Region label for screen readers. */
  label: string
  /** When not `all`, only rows whose roles match the layer prefix. */
  layerFilter?: SemanticLayerFilter | undefined
  /** Advanced Mode: pass dark export mode so primitive names show `--color-neutral-dark-*` with correct display index. */
  tier1ExportMode?: Tier1NeutralExportMode | undefined
  className?: string | undefined
}

function SemanticRoleTableHead() {
  return (
    <thead className="border-b border-hairline font-mono text-muted">
      <tr>
        <th className="px-8 py-6 font-medium">Primitive</th>
        <th className="w-48 px-8 py-6 font-medium">Swatch</th>
        <th className="px-8 py-6 font-medium hidden sm:table-cell">Hex</th>
        <th className="min-w-160 px-8 py-6 font-medium hidden sm:table-cell">OKLCH</th>
        <th className="px-8 py-6 text-right font-medium">Idx</th>
      </tr>
    </thead>
  )
}

SemanticRoleTableHead.displayName = 'SemanticRoleTableHead'

type RowProps = {
  idx: number
  swatch: GlobalSwatch | undefined
  primName: string
  displayIndex: number
  hex: string
  oklch: string
}

function SemanticRoleTableRow({idx, primName: prim, displayIndex, hex, oklch}: RowProps) {
  const swatchBg = hex.startsWith('#') ? hex : undefined
  return (
    <tr key={`prim-${idx}`} className="border-b border-hairline">
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
      <td className="px-8 py-6 align-middle tabular-nums text-subtle hidden sm:table-cell">{hex}</td>
      <td className="max-w-[min(28rem,55vw)] px-8 py-6 align-middle break-all text-subtle hidden sm:table-cell">{oklch}</td>
      <td className="px-8 py-6 text-right align-middle tabular-nums text-muted">{displayIndex}</td>
    </tr>
  )
}

SemanticRoleTableRow.displayName = 'SemanticRoleTableRow'

/**
 * Deduplicated primitive ladder table: one row per `neutral-*` swatch used by mapped tokens (no semantic columns).
 */
export function SemanticRoleTable({tokenView, global, label, layerFilter = 'all', tier1ExportMode, className}: Props) {
  const base = tokenView.sortedForTable.filter(
    (t) => !isOverflowRole(t.role) && !(isBrandPairRole(t.role) && t.customColor),
  )
  const filtered =
    layerFilter === 'all' ? base : base.filter((t) => roleMatchesLayerFilter(t.role, layerFilter))
  const seen = new Set<number>()
  const primitiveIndices: number[] = []
  for (const t of filtered) {
    const i = t.sourceGlobalIndex
    if (!seen.has(i)) {
      seen.add(i)
      primitiveIndices.push(i)
    }
  }
  primitiveIndices.sort((a, b) => {
    const ka = primitiveSortKey(global[a])
    const kb = primitiveSortKey(global[b])
    if (ka !== kb) return ka - kb
    const la = global[a]?.label ?? ''
    const lb = global[b]?.label ?? ''
    return la.localeCompare(lb, undefined, {numeric: true})
  })

  if (primitiveIndices.length === 0) {
    return (
      <p className="rounded-lg border border-hairline bg-raised px-12 py-8 text-xs text-muted">
        {layerFilter !== 'all'
          ? 'No tokens for this layer filter.'
          : 'No mapped roles for this theme.'}
      </p>
    )
  }

  return (
    <div className={cn('overflow-x-auto rounded-sm border border-hairline bg-raised', className)} role="region" aria-label={label}>
      <table className="w-full min-w-md text-left text-micro">
        <caption className="sr-only">{label}</caption>
        <SemanticRoleTableHead />
        <tbody className="font-mono">
          {primitiveIndices.map((idx) => (
            <SemanticRoleTableRow
              key={`prim-${idx}`}
              idx={idx}
              swatch={global[idx]}
              primName={primitiveNeutralExportName(global, idx, tier1ExportMode)}
              displayIndex={idx}
              hex={global[idx]?.serialized.hex ?? '—'}
              oklch={global[idx]?.serialized.oklchCss ?? '—'}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
SemanticRoleTable.displayName = 'SemanticRoleTable'
