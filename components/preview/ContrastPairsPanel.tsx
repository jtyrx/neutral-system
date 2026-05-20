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
    <div className="space-y-8">
      <p className="text-micro font-medium uppercase tracking-[0.12em] text-muted">{label}</p>
      <div className="overflow-x-auto rounded-xl border border-hairline">
        <table className="w-full min-w-[20rem] text-left text-micro">
          <thead className="border-b border-hairline text-disabled">
            <tr>
              <th className="px-8 py-6 font-medium">Pair</th>
              <th className="px-8 py-6 font-medium">Ratio</th>
              <th className="px-8 py-6 font-medium">Body</th>
              <th className="px-8 py-6 font-medium">UI</th>
            </tr>
          </thead>
          <tbody>
            {pairs.map((p) => (
              <tr
                key={p.id}
                className={`border-b border-hairline ${
                  !p.passAaBody ? 'bg-rose-500/[0.07]' : ''
                }`}
              >
                <td className="px-8 py-6 text-default">{p.label}</td>
                <td className="px-8 py-6 font-mono tabular-nums text-subtle">
                  {p.ratio.toFixed(2)}∶1
                </td>
                <td className="px-8 py-6 text-muted">{p.bodyLevel}</td>
                <td className="px-8 py-6 text-muted">{p.uiLevel}</td>
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
    <div className="space-y-24 rounded-2xl border border-hairline bg-raised p-16 sm:p-20">
      <div>
        <p className="eyebrow">Contrast contracts</p>
        <p className="mt-4 text-sm text-muted">
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
