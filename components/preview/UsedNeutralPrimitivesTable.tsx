'use client'

import {memo, useMemo} from 'react'

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
}

/**
 * One row per used `neutral-*` primitive: swatch, name, hex, OKLCH, idx — deduplicated, no semantics.
 * Custom brand is preview-only and intentionally excluded; this table reflects exportable ramp rows.
 */
function UsedNeutralPrimitivesTableInner({global, usedIndices, label, tier1ExportMode}: Props) {
  const isDarkAdvanced =
    tier1ExportMode?.architecture === 'advanced' && tier1ExportMode.scale === 'dark'

  const rows = useMemo(() => {
    const indices = [...usedIndices].filter((i) => i >= 0 && i < global.length)
    if (isDarkAdvanced) {
      // Sort darkest-first: highest ramp index = darkest = display index 0
      indices.sort((a, b) => b - a)
    } else {
      indices.sort((a, b) => {
        const ka = primitiveSortKey(global[a])
        const kb = primitiveSortKey(global[b])
        if (ka !== kb) return ka - kb
        const la = global[a]?.label ?? ''
        const lb = global[b]?.label ?? ''
        return la.localeCompare(lb, undefined, {numeric: true})
      })
    }
    return indices
  }, [usedIndices, global, isDarkAdvanced])

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-hairline bg-raised px-3 py-2 text-xs text-muted">
        No mapped primitives — adjust system mapping to reference ramp steps.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-[0.6rem] leading-snug text-disabled">
        Every global index referenced by light or dark system tokens (including emphasis). Semantic
        layer filter does not apply.
      </p>
      <div className="overflow-x-auto rounded-xl border border-hairline bg-raised" role="region" aria-label={label}>
        <table className="w-full min-w-md text-left text-[0.65rem]">
          <thead className="border-b border-hairline font-mono text-muted">
            <tr>
              <th className="px-2 py-1.5 font-medium">Primitive</th>
              <th className="w-12 px-2 py-1.5 font-medium">Swatch</th>
              <th className="px-2 py-1.5 font-medium">Hex</th>
              <th className="min-w-40 px-2 py-1.5 font-medium">OKLCH</th>
              <th className="px-2 py-1.5 text-right font-medium">Idx</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((idx) => {
              const sw = global[idx]
              const prim = primitiveNeutralExportName(global, idx, tier1ExportMode)
              const displayIndex = isDarkAdvanced ? global.length - 1 - idx : idx
              const hex = sw?.serialized.hex ?? '—'
              const oklch = sw?.serialized.oklchCss ?? '—'
              const swatchBg = hex.startsWith('#') ? hex : undefined
              return (
                <tr key={`used-prim-${idx}`} className="border-b border-hairline">
                  <td className="px-2 py-1.5 align-middle">
                    <span className="font-medium text-default">{prim}</span>
                  </td>
                  <td className="px-2 py-1.5 align-middle">
                    <span
                      className="inline-block h-9 w-9 shrink-0 rounded border border-hairline-strong shadow-inner"
                      style={swatchBg ? {backgroundColor: swatchBg} : undefined}
                      title={`${prim} · ${hex}`}
                    />
                  </td>
                  <td className="px-2 py-1.5 align-middle tabular-nums text-subtle">{hex}</td>
                  <td className="max-w-[min(28rem,55vw)] px-2 py-1.5 align-middle break-all text-subtle">
                    {oklch}
                  </td>
                  <td className="px-2 py-1.5 text-right align-middle tabular-nums text-muted">{displayIndex}</td>
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
