'use client'

import {memo, useMemo} from 'react'

import {primitiveNeutralExportName, primitiveSortKey} from '@/components/preview/primitiveTokenTable'
import type {GlobalSwatch} from '@/lib/neutral-engine'

type Props = {
  global: GlobalSwatch[]
  /** Global ramp indices referenced by any system token (e.g. from {@link usedGlobalIndicesFromTokenViews}). */
  usedIndices: ReadonlySet<number>
  /** Region label for screen readers. */
  label: string
}

/**
 * One row per used `neutral-*` primitive: swatch, name, hex, OKLCH, idx — deduplicated, no semantics.
 */
function UsedNeutralPrimitivesTableInner({global, usedIndices, label}: Props) {
  const rows = useMemo(() => {
    const indices = [...usedIndices].filter((i) => i >= 0 && i < global.length)
    indices.sort((a, b) => {
      const ka = primitiveSortKey(global[a])
      const kb = primitiveSortKey(global[b])
      if (ka !== kb) return ka - kb
      const la = global[a]?.label ?? ''
      const lb = global[b]?.label ?? ''
      return la.localeCompare(lb, undefined, {numeric: true})
    })
    return indices
  }, [usedIndices, global])

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/45">
        No mapped primitives — adjust system mapping to reference ramp steps.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-[0.6rem] leading-snug text-white/40">
        Every global index referenced by light or dark system tokens (including emphasis). Semantic
        layer filter does not apply.
      </p>
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20" role="region" aria-label={label}>
        <table className="w-full min-w-[28rem] text-left text-[0.65rem]">
          <thead className="border-b border-white/10 font-mono text-white/45">
            <tr>
              <th className="px-2 py-1.5 font-medium">Primitive</th>
              <th className="w-12 px-2 py-1.5 font-medium">Swatch</th>
              <th className="px-2 py-1.5 font-medium">Hex</th>
              <th className="min-w-[10rem] px-2 py-1.5 font-medium">OKLCH</th>
              <th className="px-2 py-1.5 text-right font-medium">Idx</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((idx) => {
              const sw = global[idx]
              const prim = primitiveNeutralExportName(global, idx)
              const hex = sw?.serialized.hex ?? '—'
              const oklch = sw?.serialized.oklchCss ?? '—'
              const swatchBg = hex.startsWith('#') ? hex : undefined
              return (
                <tr key={`used-prim-${idx}`} className="border-b border-white/[0.06]">
                  <td className="px-2 py-1.5 align-middle">
                    <span className="font-medium text-white/90">{prim}</span>
                  </td>
                  <td className="px-2 py-1.5 align-middle">
                    <span
                      className="inline-block h-9 w-9 shrink-0 rounded border border-white/15 shadow-inner"
                      style={swatchBg ? {backgroundColor: swatchBg} : undefined}
                      title={`${prim} · ${hex}`}
                    />
                  </td>
                  <td className="px-2 py-1.5 align-middle tabular-nums text-white/75">{hex}</td>
                  <td className="max-w-[min(28rem,55vw)] px-2 py-1.5 align-middle break-all text-white/60">
                    {oklch}
                  </td>
                  <td className="px-2 py-1.5 text-right align-middle tabular-nums text-white/50">{idx}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export const UsedNeutralPrimitivesTable = memo(UsedNeutralPrimitivesTableInner)
