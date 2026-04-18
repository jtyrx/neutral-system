'use client'

import {memo, useMemo} from 'react'

import {humanizeRole} from '@/components/preview/previewLabels'
import {
  primitiveNeutralExportName,
  sortSystemTokensByPrimitiveLadder,
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
 * Primitive-token inspection table: neutral-* ladder as primary identifier; semantic role de-emphasized.
 */
function SemanticRoleTableInner({tokenView, global, label, layerFilter = 'all'}: Props) {
  const rows = useMemo(() => {
    const base = tokenView.sortedForTable.filter((t) => !isOverflowRole(t.role))
    const filtered = layerFilter === 'all' ? base : base.filter((t) => roleMatchesLayerFilter(t.role, layerFilter))
    return sortSystemTokensByPrimitiveLadder(filtered, global)
  }, [tokenView, layerFilter, global])

  /** First row index per source global index — only that row renders the filled swatch (Paired Roles scanability). */
  const firstRowForSourceIndex = useMemo(() => {
    const m = new Map<number, number>()
    rows.forEach((t, i) => {
      if (!m.has(t.sourceGlobalIndex)) m.set(t.sourceGlobalIndex, i)
    })
    return m
  }, [rows])

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/45">
        {layerFilter !== 'all'
          ? 'No tokens for this layer filter.'
          : 'No mapped roles for this theme.'}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20" role="region" aria-label={label}>
      <table className="w-full min-w-[16rem] text-left text-[0.65rem]">
        <thead className="border-b border-white/10 font-mono text-white/45">
          <tr>
            <th className="px-2 py-1.5 font-medium">Primitive</th>
            <th className="px-2 py-1.5 text-right font-medium">Idx</th>
            <th className="w-12 px-2 py-1.5 font-medium">Swatch</th>
          </tr>
        </thead>
        <tbody className="font-mono">
          {rows.map((t, rowIndex) => {
            const prim = primitiveNeutralExportName(global, t.sourceGlobalIndex)
            const showSwatch = firstRowForSourceIndex.get(t.sourceGlobalIndex) === rowIndex
            return (
              <tr key={t.id} className="border-b border-white/[0.06]">
                <td className="px-2 py-1.5 align-top">
                  <span className="block font-medium text-white/90">{prim}</span>
                  <span className="mt-0.5 block text-[0.6rem] font-normal leading-snug text-white/35">
                    {humanizeRole(t.role)}
                    <span className="text-white/25"> · </span>
                    <span className="text-white/30">{t.name}</span>
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right align-top tabular-nums text-white/50">
                  {t.sourceGlobalIndex}
                </td>
                <td className="px-2 py-1.5 align-middle">
                  {showSwatch ? (
                    <span
                      className="inline-block h-9 w-9 shrink-0 rounded border border-white/15 shadow-inner"
                      style={{backgroundColor: t.serialized.hex}}
                      title={`${prim} · idx ${t.sourceGlobalIndex}`}
                    />
                  ) : (
                    <span
                      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded border border-dashed border-white/20 bg-white/[0.02] text-[0.65rem] text-white/30"
                      title={`Same primitive as above · ${prim} · idx ${t.sourceGlobalIndex}`}
                      aria-label={`Same color swatch as earlier row for ${prim}`}
                    >
                      ↳
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export const SemanticRoleTable = memo(SemanticRoleTableInner)
