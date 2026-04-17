'use client'

import {memo} from 'react'

import {friendlySemanticGroupLabel} from '@/components/preview/previewLabels'
import type {GlobalSwatch, SystemRole, SystemToken, TokenView} from '@/lib/neutral-engine'

const PAIR_ROLES: SystemRole[] = ['fill', 'stroke', 'text', 'alt']

function zipByName(light: SystemToken[], dark: SystemToken[]): {light: SystemToken; dark: SystemToken}[] {
  const darkByName = new Map(dark.map((t) => [t.name, t]))
  const out: {light: SystemToken; dark: SystemToken}[] = []
  for (const l of light) {
    const d = darkByName.get(l.name)
    if (d) out.push({light: l, dark: d})
  }
  return out
}

export type PairEmphasis = 'light' | 'dark' | 'both'

type PairRowProps = {
  pair: {light: SystemToken; dark: SystemToken}
  global: GlobalSwatch[]
  emphasis: PairEmphasis
}

const PairRow = memo(function PairRow({pair, global, emphasis}: PairRowProps) {
  const {light: lt, dark: dt} = pair
  const swL = global[lt.sourceGlobalIndex]
  const swD = global[dt.sourceGlobalIndex]

  const lightMuted = emphasis === 'dark'
  const darkMuted = emphasis === 'light'

  const lightCard =
    emphasis === 'light'
      ? 'border-amber-400/35 bg-amber-500/[0.08] ring-1 ring-amber-400/20'
      : 'border-white/10 bg-black/25'
  const darkCard =
    emphasis === 'dark'
      ? 'border-sky-400/35 bg-sky-500/[0.08] ring-1 ring-sky-400/20'
      : 'border-white/10 bg-black/25'

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <div
        className={`flex gap-3 rounded-lg border p-3 transition-opacity ${lightCard} ${lightMuted ? 'opacity-50' : ''}`}
      >
        <span
          className="h-12 w-12 shrink-0 rounded-lg border border-white/15 shadow-inner"
          style={{backgroundColor: lt.serialized.hex}}
          title={swL?.label}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white/90">{friendlySemanticGroupLabel(lt.role)}</p>
          <p className="mt-0.5 font-mono text-[0.65rem] text-white/45">{lt.name}</p>
          <p className="mt-1 font-mono text-[0.6rem] tabular-nums text-white/35">idx {lt.sourceGlobalIndex}</p>
        </div>
      </div>
      <div
        className={`flex gap-3 rounded-lg border p-3 transition-opacity ${darkCard} ${darkMuted ? 'opacity-50' : ''}`}
      >
        <span
          className="h-12 w-12 shrink-0 rounded-lg border border-white/15 shadow-inner"
          style={{backgroundColor: dt.serialized.hex}}
          title={swD?.label}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white/90">{friendlySemanticGroupLabel(dt.role)}</p>
          <p className="mt-0.5 font-mono text-[0.65rem] text-white/45">{dt.name}</p>
          <p className="mt-1 font-mono text-[0.6rem] tabular-nums text-white/35">idx {dt.sourceGlobalIndex}</p>
        </div>
      </div>
    </div>
  )
})

type Props = {
  lightTokenView: TokenView
  darkTokenView: TokenView
  global: GlobalSwatch[]
  /** Optional note under a group (e.g. text inversion). */
  groupHint?: Partial<Record<SystemRole, string>>
  /** Subset of primitive roles to show; default all four. */
  roles?: readonly SystemRole[]
  /** Highlight Light column, Dark column, or balance both. */
  pairEmphasis?: PairEmphasis
}

/**
 * Side-by-side Light | Dark rows, paired by token name within each semantic group.
 */
function SemanticPairGridInner({
  lightTokenView,
  darkTokenView,
  global,
  groupHint,
  roles = PAIR_ROLES,
  pairEmphasis = 'both',
}: Props) {
  return (
    <div className="space-y-10">
      {roles.map((role) => {
        const light = lightTokenView.byRole.get(role) ?? []
        const dark = darkTokenView.byRole.get(role) ?? []
        const pairs = zipByName(light, dark)
        if (pairs.length === 0) return null

        const hint = groupHint?.[role]

        return (
          <div key={role} className="space-y-3 border-b border-white/[0.07] pb-10 last:border-b-0 last:pb-0">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                {friendlySemanticGroupLabel(role)}
              </h3>
              {hint ? <p className="mt-1 text-[0.65rem] text-white/40">{hint}</p> : null}
            </div>
            <div className="space-y-3">
              <div className="mb-1 hidden gap-4 sm:grid sm:grid-cols-2">
                <p className="text-[0.6rem] font-medium uppercase tracking-wide text-amber-200/80">Light</p>
                <p className="text-[0.6rem] font-medium uppercase tracking-wide text-sky-200/80">
                  Dark elevated
                </p>
              </div>
              {pairs.map((pair) => (
                <PairRow key={pair.light.id} pair={pair} global={global} emphasis={pairEmphasis} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const SemanticPairGrid = memo(SemanticPairGridInner)

const singleAccentClass = (accent?: 'amber' | 'sky') =>
  accent === 'amber'
    ? 'border-amber-400/30 bg-amber-500/[0.07] ring-1 ring-amber-400/15'
    : accent === 'sky'
      ? 'border-sky-400/30 bg-sky-500/[0.07] ring-1 ring-sky-400/15'
      : 'border-white/10 bg-black/25'

const SingleTokenRow = memo(function SingleTokenRow({
  t,
  global,
  accent,
}: {
  t: SystemToken
  global: GlobalSwatch[]
  accent?: 'amber' | 'sky'
}) {
  const sw = global[t.sourceGlobalIndex]
  return (
    <div className={`flex gap-3 rounded-lg border p-3 ${singleAccentClass(accent)}`}>
      <span
        className="h-12 w-12 shrink-0 rounded-lg border border-white/15 shadow-inner"
        style={{backgroundColor: t.serialized.hex}}
        title={sw?.label}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-white/90">{friendlySemanticGroupLabel(t.role)}</p>
        <p className="mt-0.5 font-mono text-[0.65rem] text-white/45">{t.name}</p>
        <p className="mt-1 font-mono text-[0.6rem] tabular-nums text-white/35">idx {t.sourceGlobalIndex}</p>
      </div>
    </div>
  )
})

type SingleProps = {
  tokenView: TokenView
  global: GlobalSwatch[]
  groupHint?: Partial<Record<SystemRole, string>>
  roles?: readonly SystemRole[]
  /** Match preview column chrome (Light = amber, Dark = sky). */
  themeChrome?: 'light' | 'dark'
}

/** One theme only — Focus layout. */
function SemanticSingleThemeGridInner({
  tokenView,
  global,
  groupHint,
  roles = PAIR_ROLES,
  themeChrome,
}: SingleProps) {
  const accent = themeChrome === 'light' ? 'amber' : themeChrome === 'dark' ? 'sky' : undefined
  return (
    <div className="space-y-10">
      {roles.map((role) => {
        const toks = tokenView.byRole.get(role) ?? []
        if (toks.length === 0) return null
        const hint = groupHint?.[role]
        return (
          <div key={role} className="space-y-3 border-b border-white/[0.07] pb-10 last:border-b-0 last:pb-0">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                {friendlySemanticGroupLabel(role)}
              </h3>
              {hint ? <p className="mt-1 text-[0.65rem] text-white/40">{hint}</p> : null}
            </div>
            <div className="space-y-3">
              {toks.map((t) => (
                <SingleTokenRow key={t.id} t={t} global={global} accent={accent} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const SemanticSingleThemeGrid = memo(SemanticSingleThemeGridInner)
