'use client'

import {memo} from 'react'

import {friendlySemanticCategoryLabel, humanizeRole} from '@/components/preview/previewLabels'
import type {GlobalSwatch, SystemToken, TokenView} from '@/lib/neutral-engine'
import type {SemanticLayer} from '@/lib/neutral-engine/tokenViews'
import {
  tokensForInversePairCategory,
  tokensForSemanticLayerPublicNonInverse,
} from '@/lib/neutral-engine/tokenViews'

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

/** One semantic layer group or the dedicated inverse contrast-flip group. */
export type PairSection = {kind: 'layer'; layer: SemanticLayer} | {kind: 'inverse'}

/** Default paired-role order: hierarchy surfaces → borders → content → inverse pair → interactive. */
export const DEFAULT_PAIR_SECTIONS: PairSection[] = [
  {kind: 'layer', layer: 'surface'},
  {kind: 'layer', layer: 'border'},
  {kind: 'layer', layer: 'text'},
  {kind: 'inverse'},
  {kind: 'layer', layer: 'interactive'},
]

export type PairedRoleGroupHints = Partial<Record<SemanticLayer, string>> & {
  /** Subcopy under the Inverse heading (contrast-flip roles). */
  inversePair?: string
}

function tokensForPairSection(view: TokenView, section: PairSection): SystemToken[] {
  if (section.kind === 'inverse') return tokensForInversePairCategory(view)
  return tokensForSemanticLayerPublicNonInverse(view, section.layer)
}

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
          <p className="text-sm font-medium text-white/90">{humanizeRole(lt.role)}</p>
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
          <p className="text-sm font-medium text-white/90">{humanizeRole(dt.role)}</p>
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
  /** Optional notes under each layer group (e.g. text ramp) and the Inverse category. */
  groupHints?: PairedRoleGroupHints
  /** Section order; default separates inverse roles into their own category. */
  pairSections?: readonly PairSection[]
  /** Highlight Light column, Dark column, or balance both. */
  pairEmphasis?: PairEmphasis
}

/**
 * Side-by-side Light | Dark rows, paired by token name within each semantic layer.
 */
function SemanticPairGridInner({
  lightTokenView,
  darkTokenView,
  global,
  groupHints,
  pairSections = DEFAULT_PAIR_SECTIONS,
  pairEmphasis = 'both',
}: Props) {
  return (
    <div className="space-y-10">
      {pairSections.map((section) => {
        const light = tokensForPairSection(lightTokenView, section)
        const dark = tokensForPairSection(darkTokenView, section)
        const pairs = zipByName(light, dark)
        if (pairs.length === 0) return null

        const titleKey = section.kind === 'inverse' ? 'inversePair' : section.layer
        const hint =
          section.kind === 'inverse' ? groupHints?.inversePair : groupHints?.[section.layer]
        const isInverse = section.kind === 'inverse'

        return (
          <div
            key={section.kind === 'inverse' ? 'inverse' : section.layer}
            className={`space-y-3 pb-10 last:pb-0 ${
              isInverse
                ? 'rounded-xl border border-violet-400/15 bg-violet-500/[0.04] p-4'
                : 'border-b border-white/[0.07]'
            }`}
          >
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                {friendlySemanticCategoryLabel(titleKey)}
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
        <p className="text-sm font-medium text-white/90">{humanizeRole(t.role)}</p>
        <p className="mt-0.5 font-mono text-[0.65rem] text-white/45">{t.name}</p>
        <p className="mt-1 font-mono text-[0.6rem] tabular-nums text-white/35">idx {t.sourceGlobalIndex}</p>
      </div>
    </div>
  )
})

type SingleProps = {
  tokenView: TokenView
  global: GlobalSwatch[]
  groupHints?: PairedRoleGroupHints
  pairSections?: readonly PairSection[]
  /** Match preview column chrome (Light = amber, Dark = sky). */
  themeChrome?: 'light' | 'dark'
}

/** One theme only — Focus layout. */
function SemanticSingleThemeGridInner({
  tokenView,
  global,
  groupHints,
  pairSections = DEFAULT_PAIR_SECTIONS,
  themeChrome,
}: SingleProps) {
  const accent = themeChrome === 'light' ? 'amber' : themeChrome === 'dark' ? 'sky' : undefined
  return (
    <div className="space-y-10">
      {pairSections.map((section) => {
        const toks = tokensForPairSection(tokenView, section)
        if (toks.length === 0) return null
        const titleKey = section.kind === 'inverse' ? 'inversePair' : section.layer
        const hint =
          section.kind === 'inverse' ? groupHints?.inversePair : groupHints?.[section.layer]
        const isInverse = section.kind === 'inverse'
        return (
          <div
            key={section.kind === 'inverse' ? 'inverse' : section.layer}
            className={`space-y-3 pb-10 last:pb-0 ${
              isInverse
                ? 'rounded-xl border border-violet-400/15 bg-violet-500/[0.04] p-4'
                : 'border-b border-white/[0.07]'
            }`}
          >
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                {friendlySemanticCategoryLabel(titleKey)}
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
