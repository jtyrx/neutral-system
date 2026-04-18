import type {GlobalSwatch, SystemToken} from '@/lib/neutral-engine/types'

/** Numeric neutral ladder order (matches global `swatch.label` / export `neutral-*`). */
export function primitiveSortKey(sw: GlobalSwatch | undefined): number {
  if (!sw) return Number.NEGATIVE_INFINITY
  const n = Number(sw.label)
  return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY
}

/** Tier-1 export name for the ramp swatch at `sourceIndex`. */
export function primitiveNeutralExportName(global: GlobalSwatch[], sourceIndex: number): string {
  const sw = global[sourceIndex]
  return sw ? `neutral-${sw.label}` : '—'
}

/** Sort mapped system tokens by underlying primitive ladder value, then role. */
export function sortSystemTokensByPrimitiveLadder(
  tokens: SystemToken[],
  global: GlobalSwatch[],
): SystemToken[] {
  return [...tokens].sort((a, b) => {
    const ka = primitiveSortKey(global[a.sourceGlobalIndex])
    const kb = primitiveSortKey(global[b.sourceGlobalIndex])
    if (ka !== kb) return ka - kb
    const la = global[a.sourceGlobalIndex]?.label ?? ''
    const lb = global[b.sourceGlobalIndex]?.label ?? ''
    if (la !== lb) return la.localeCompare(lb, undefined, {numeric: true})
    return a.role.localeCompare(b.role)
  })
}
