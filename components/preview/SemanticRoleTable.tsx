'use client'

import {memo, useMemo} from 'react'

import {
  primitiveNeutralExportName,
  primitiveSortKey,
} from '@/components/preview/primitiveTokenTable'
import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'
import {isInversePairRole, isOverflowRole} from '@/lib/neutral-engine/semanticNaming'

/** Filter paired-role tables by semantic layer (dot-path roles). */
export type SemanticLayerFilter = 'all' | 'surface' | 'border' | 'text' | 'interactive' | 'inverse'

function roleMatchesLayerFilter(role: string, filter: SemanticLayerFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'inverse') return isInversePairRole(role)
  if (filter === 'surface') return role.startsWith('surface.') && !isInversePairRole(role)
  if (filter === 'border') return role.startsWith('border.')
  if (filter === 'text') return role.startsWith('text.') && !isInversePairRole(role)
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
  layerFilter?: SemanticLayerFilter
}

/**
 * Deduplicated primitive ladder table: one row per `neutral-*` swatch used by mapped tokens (no semantic columns).
 */
function SemanticRoleTableInner({tokenView, global, label, layerFilter = 'all'}: Props) {
  const primitiveIndices = useMemo(() => {
    // Preview-only custom brand must not appear as a neutral primitive row.
    const base = tokenView.sortedForTable.filter(
      (t) => !isOverflowRole(t.role) && !(t.role === 'surface.brand' && t.customColor),
    )
    const filtered =
      layerFilter === 'all' ? base : base.filter((t) => roleMatchesLayerFilter(t.role, layerFilter))
    const seen = new Set<number>()
    const indices: number[] = []
    for (const t of filtered) {
      const i = t.sourceGlobalIndex
      if (!seen.has(i)) {
        seen.add(i)
        indices.push(i)
      }
    }
    indices.sort((a, b) => {
      const ka = primitiveSortKey(global[a])
      const kb = primitiveSortKey(global[b])
      if (ka !== kb) return ka - kb
      const la = global[a]?.label ?? ''
      const lb = global[b]?.label ?? ''
      return la.localeCompare(lb, undefined, {numeric: true})
    })
    return indices
  }, [tokenView, layerFilter, global])

  if (primitiveIndices.length === 0) {
    return (
      <p className="rounded-lg border border-[var(--ns-hairline)] bg-[var(--ns-surface-raised)] px-3 py-2 text-xs text-[var(--ns-text-muted)]">
        {layerFilter !== 'all'
          ? 'No tokens for this layer filter.'
          : 'No mapped roles for this theme.'}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--ns-hairline)] bg-[var(--ns-surface-raised)]" role="region" aria-label={label}>
      <table className="w-full min-w-[28rem] text-left text-[0.65rem]">
        <thead className="border-b border-[var(--ns-hairline)] font-mono text-[var(--ns-text-muted)]">
          <tr>
            <th className="px-2 py-1.5 font-medium">Primitive</th>
            <th className="w-12 px-2 py-1.5 font-medium">Swatch</th>
            <th className="px-2 py-1.5 font-medium hidden sm:table-cell">Hex</th>
            <th className="min-w-[10rem] px-2 py-1.5 font-medium hidden sm:table-cell">OKLCH</th>
            <th className="px-2 py-1.5 text-right font-medium">Idx</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {primitiveIndices.map((idx) => {
            const sw = global[idx]
            const prim = primitiveNeutralExportName(global, idx)
            const hex = sw?.serialized.hex ?? '—'
            const oklch = sw?.serialized.oklchCss ?? '—'
            const swatchBg = hex.startsWith('#') ? hex : undefined
            return (
              <tr key={`prim-${idx}`} className="border-b border-[var(--ns-hairline)]">
                <td className="px-2 py-1.5 align-middle">
                  <span className="font-medium text-[var(--ns-text)]">{prim}</span>
                </td>
                <td className="px-2 py-1.5 align-middle">
                  <span
                    className="inline-block h-9 w-9 shrink-0 rounded border border-[var(--ns-hairline-strong)] shadow-inner"
                    style={swatchBg ? {backgroundColor: swatchBg} : undefined}
                    title={`${prim} · ${hex}`}
                  />
                </td>
                <td className="px-2 py-1.5 align-middle tabular-nums text-[var(--ns-text-subtle)] hidden sm:table-cell">{hex}</td>
                <td className="max-w-[min(28rem,55vw)] px-2 py-1.5 align-middle break-all text-[var(--ns-text-subtle)] hidden sm:table-cell">{oklch}</td>
                <td className="px-2 py-1.5 text-right align-middle tabular-nums text-[var(--ns-text-muted)]">{idx}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export const SemanticRoleTable = memo(SemanticRoleTableInner)
