import {cn} from '@/lib/cn'
import type {BlockChainSpec, ChainEntry} from '@/components/preview/blockChainTypes'
import type {GlobalSwatch, SystemToken} from '@/lib/neutral-engine/types'

type Props = {
  spec: BlockChainSpec
  globalLight: GlobalSwatch[]
  globalDark: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
  className?: string | undefined
}

function resolveEntry(
  entry: ChainEntry,
  tokens: SystemToken[],
  global: GlobalSwatch[],
): {primitiveIndex: number; swatch: GlobalSwatch | null} {
  // dtcgPath is "color.surface.raised" — strip "color." prefix to get role name "surface.raised"
  const roleName = entry.dtcgPath.replace(/^color\./, '')
  const token = tokens.find(t => t.name === roleName) ?? null
  const swatch = token != null ? (global[token.sourceGlobalIndex] ?? null) : null
  return {primitiveIndex: token?.sourceGlobalIndex ?? -1, swatch}
}

type SwatchColumnProps = {
  entry: ChainEntry
  tokens: SystemToken[]
  global: GlobalSwatch[]
  label: string
}

function SwatchColumn({entry, tokens, global, label}: SwatchColumnProps) {
  const {primitiveIndex, swatch} = resolveEntry(entry, tokens, global)
  const hex = swatch?.serialized.hex ?? null

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <span className="text-micro text-muted tabular-nums">{label}</span>
      <div className="flex items-center gap-6">
        <span
          className="inline-block h-24 w-24 shrink-0 rounded border border-hairline-strong shadow-inner"
          style={hex != null ? {backgroundColor: hex} : undefined}
          title={hex ?? 'unresolved'}
          aria-hidden="true"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-mono text-micro text-subtle">{entry.dtcgPath}</span>
          <span className="font-mono text-micro text-muted tabular-nums">
            {primitiveIndex >= 0 ? `Step ${primitiveIndex + 1} · ${hex ?? '—'}` : '—'}
          </span>
        </div>
      </div>
    </div>
  )
}

type ChainRowProps = {
  entry: ChainEntry
  globalLight: GlobalSwatch[]
  globalDark: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
}

function ChainRow({entry, globalLight, globalDark, lightTokens, darkTokens}: ChainRowProps) {
  return (
    <div className="flex flex-col gap-6 border-b border-hairline py-10 last:border-b-0">
      <div className="flex items-baseline gap-8">
        <span className="text-sm font-medium text-default">{entry.element}</span>
        <span className="font-mono text-micro text-muted">{entry.cssVar}</span>
        <span className="font-mono text-micro text-muted opacity-60">{entry.usage}</span>
      </div>
      <div className="flex gap-16">
        <SwatchColumn
          entry={entry}
          tokens={lightTokens}
          global={globalLight}
          label="Light"
        />
        <SwatchColumn
          entry={entry}
          tokens={darkTokens}
          global={globalDark}
          label="Dark"
        />
      </div>
      {entry.description != null && (
        <p className="text-micro text-muted">{entry.description}</p>
      )}
    </div>
  )
}

export function BlockTokenChainPanel({
  spec,
  globalLight,
  globalDark,
  lightTokens,
  darkTokens,
  className,
}: Props) {
  return (
    <div
      className={cn('rounded-sm border border-hairline bg-raised px-12 py-4', className)}
      role="region"
      aria-label={`Token chain for ${spec.blockId}`}
    >
      {spec.entries.map(entry => (
        <ChainRow
          key={`${entry.dtcgPath}::${entry.element}`}
          entry={entry}
          globalLight={globalLight}
          globalDark={globalDark}
          lightTokens={lightTokens}
          darkTokens={darkTokens}
        />
      ))}
    </div>
  )
}
BlockTokenChainPanel.displayName = 'BlockTokenChainPanel'
