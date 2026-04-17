'use client'

import {memo} from 'react'

import {friendlySemanticGroupLabel} from '@/components/preview/previewLabels'
import type {GlobalSwatch, SystemRole, TokenView} from '@/lib/neutral-engine'

type Props = {
  tokenView: TokenView
  global: GlobalSwatch[]
  /** Region label for screen readers. */
  label: string
  /** When set, only rows for these primitive roles (e.g. fill / stroke / text / alt). */
  roles?: readonly SystemRole[]
}

/**
 * Advanced view: full token rows with index as secondary metadata.
 */
function SemanticRoleTableInner({tokenView, global, label, roles}: Props) {
  const rows =
    roles && roles.length > 0
      ? tokenView.sortedForTable.filter((t) => roles.includes(t.role))
      : tokenView.sortedForTable

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/45">
        {roles && roles.length > 0
          ? 'No tokens for this layer filter.'
          : 'No mapped roles for this theme.'}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20" role="region" aria-label={label}>
      <table className="w-full min-w-[18rem] text-left text-[0.65rem]">
        <thead className="border-b border-white/10 text-white/45">
          <tr>
            <th className="px-2 py-1.5 font-medium">Semantic</th>
            <th className="px-2 py-1.5 font-medium">Token</th>
            <th className="px-2 py-1.5 font-medium">Swatch</th>
            <th className="px-2 py-1.5 text-right font-medium">Idx</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => {
            const sw = global[t.sourceGlobalIndex]
            return (
              <tr key={t.id} className="border-b border-white/[0.06]">
                <td className="px-2 py-1.5 text-white/90">{friendlySemanticGroupLabel(t.role)}</td>
                <td className="px-2 py-1.5 font-mono text-white/55">{t.name}</td>
                <td className="px-2 py-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block h-4 w-4 shrink-0 rounded border border-white/15"
                      style={{backgroundColor: t.serialized.hex}}
                      title={sw?.label}
                    />
                    <span className="max-w-[8rem] truncate text-white/45">{sw?.label ?? '—'}</span>
                  </span>
                </td>
                <td className="px-2 py-1.5 text-right font-mono text-[0.6rem] tabular-nums text-white/35">
                  {t.sourceGlobalIndex}
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
