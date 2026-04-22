'use client'

import {memo, useMemo} from 'react'

import {buildContrastPairResults} from '@/lib/neutral-engine/contrastContracts'
import type {SystemToken} from '@/lib/neutral-engine/types'

type Props = {
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
}

function PairTable({label, tokens}: {label: string; tokens: SystemToken[]}) {
  const pairs = useMemo(() => buildContrastPairResults(tokens), [tokens])
  if (pairs.length === 0) return null
  return (
    <div className="space-y-2">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-[var(--ns-text-muted)]">{label}</p>
      <div className="overflow-x-auto rounded-xl border border-[var(--ns-hairline)]">
        <table className="w-full min-w-[20rem] text-left text-[0.65rem]">
          <thead className="border-b border-[var(--ns-hairline)] text-[var(--ns-text-faint)]">
            <tr>
              <th className="px-2 py-1.5 font-medium">Pair</th>
              <th className="px-2 py-1.5 font-medium">Ratio</th>
              <th className="px-2 py-1.5 font-medium">Body</th>
              <th className="px-2 py-1.5 font-medium">UI</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-[var(--ns-hairline)] ${
                  !p.passAaBody ? 'bg-rose-500/[0.07]' : ''
                }`}
              >
                <td className="px-2 py-1.5 text-[var(--ns-text)]">{p.label}</td>
                <td className="px-2 py-1.5 font-mono tabular-nums text-[var(--ns-text-subtle)]">
                  {p.ratio.toFixed(2)}∶1
                </td>
                <td className="px-2 py-1.5 text-[var(--ns-text-muted)]">{p.bodyLevel}</td>
                <td className="px-2 py-1.5 text-[var(--ns-text-muted)]">{p.uiLevel}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ContrastPairsPanelInner({lightTokens, darkTokens}: Props) {
  return (
    <div className="space-y-6 rounded-2xl border border-[var(--ns-hairline)] bg-[var(--ns-surface-raised)] p-4 sm:p-5">
      <div>
        <p className="eyebrow">Contrast contracts</p>
        <p className="mt-1 text-sm text-[var(--ns-text-muted)]">
          WCAG 2.1 contrast for recommended surface × text pairs. Rows below 4.5∶1 (body) are
          flagged.
        </p>
      </div>
      <PairTable label="Light" tokens={lightTokens} />
      <PairTable label="Dark elevated" tokens={darkTokens} />
    </div>
  )
}

export const ContrastPairsPanel = memo(ContrastPairsPanelInner)
