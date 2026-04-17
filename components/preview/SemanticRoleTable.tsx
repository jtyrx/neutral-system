'use client'

import {useMemo} from 'react'

import {humanizeRole, ROLE_DISPLAY_ORDER} from '@/components/preview/previewLabels'
import type {GlobalSwatch, SystemRole, SystemToken} from '@/lib/neutral-engine/types'

type Props = {
  tokens: SystemToken[]
  global: GlobalSwatch[]
  /** Region label for screen readers. */
  label: string
}

function roleRank(role: SystemRole): number {
  const i = ROLE_DISPLAY_ORDER.indexOf(role)
  return i === -1 ? 999 : i
}

/**
 * Ordered list of semantic tokens with global index and swatch label for comparison clarity.
 */
export function SemanticRoleTable({tokens, global, label}: Props) {
  const rows = useMemo(() => {
    return [...tokens].sort((a, b) => {
      const rd = roleRank(a.role) - roleRank(b.role)
      if (rd !== 0) return rd
      return a.name.localeCompare(b.name)
    })
  }, [tokens])

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/45">
        No mapped roles for this theme.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/20" role="region" aria-label={label}>
      <table className="w-full min-w-[18rem] text-left text-[0.65rem]">
        <thead className="border-b border-white/10 text-white/45">
          <tr>
            <th className="px-2 py-1.5 font-medium">Role</th>
            <th className="px-2 py-1.5 font-medium">Token</th>
            <th className="px-2 py-1.5 font-medium">Index</th>
            <th className="px-2 py-1.5 font-medium">Swatch</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((t) => {
            const sw = global[t.sourceGlobalIndex]
            return (
              <tr key={t.id} className="border-b border-white/[0.06]">
                <td className="px-2 py-1.5 text-white/85">{humanizeRole(t.role)}</td>
                <td className="px-2 py-1.5 font-mono text-white/70">{t.name}</td>
                <td className="px-2 py-1.5 font-mono text-white/55">{t.sourceGlobalIndex}</td>
                <td className="px-2 py-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span
                      className="inline-block h-4 w-4 shrink-0 rounded border border-white/15"
                      style={{backgroundColor: t.serialized.hex}}
                      title={sw?.label}
                    />
                    <span className="max-w-[8rem] truncate text-white/50">{sw?.label ?? '—'}</span>
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
