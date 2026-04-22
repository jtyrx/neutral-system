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
  /** Only first row per source index shows the filled swatch (per column). */
  showLightSwatch: boolean
  showDarkSwatch: boolean
}

function SwatchOrSamePrimitive({
  show,
  hex,
  label,
  title,
}: {
  show: boolean
  hex: string
  label: string | undefined
  title: string
}) {
  if (show) {
    return (
      <span
        className="h-12 w-12 shrink-0 rounded-lg border border-[var(--ns-hairline-strong)] shadow-inner"
        style={{backgroundColor: hex}}
        title={label}
      />
    )
  }
  return (
    <span
      className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--ns-hairline-strong)] bg-[var(--ns-overlay-soft)] text-[0.7rem] text-[var(--ns-text-faint)]"
      title={`Same primitive as above · ${title}`}
      aria-label="Same color swatch as earlier row"
    >
      ↳
    </span>
  )
}

const PairRow = memo(function PairRow({
  pair,
  global,
  emphasis,
  showLightSwatch,
  showDarkSwatch,
}: PairRowProps) {
  const {light: lt, dark: dt} = pair
  const swL = global[lt.sourceGlobalIndex]
  const swD = global[dt.sourceGlobalIndex]

  const lightMuted = emphasis === 'dark'
  const darkMuted = emphasis === 'light'

  const lightCard =
    emphasis === 'light'
      ? 'border-[var(--ns-chrome-amber-border-strong)] bg-[var(--ns-chrome-amber-surface-strong)] ring-1 ring-[var(--ns-chrome-amber-ring)]'
      : 'border-[var(--ns-hairline)] bg-[var(--ns-surface-raised)]'
  const darkCard =
    emphasis === 'dark'
      ? 'border-[var(--ns-chrome-sky-border-strong)] bg-[var(--ns-chrome-sky-surface-strong)] ring-1 ring-[var(--ns-chrome-sky-ring)]'
      : 'border-[var(--ns-hairline)] bg-[var(--ns-surface-raised)]'

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
      <div
        className={`flex gap-3 rounded-lg border p-3 transition-opacity ${lightCard} ${lightMuted ? 'opacity-50' : ''}`}
      >
        <SwatchOrSamePrimitive
          show={showLightSwatch}
          hex={lt.serialized.hex}
          label={swL?.label}
          title={`idx ${lt.sourceGlobalIndex}`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--ns-text)]">{humanizeRole(lt.role)}</p>
          <p className="mt-0.5 font-mono text-[0.65rem] text-[var(--ns-text-muted)]">{lt.name}</p>
          <p className="mt-1 font-mono text-[0.6rem] tabular-nums text-[var(--ns-text-faint)]">idx {lt.sourceGlobalIndex}</p>
        </div>
      </div>
      <div
        className={`flex gap-3 rounded-lg border p-3 transition-opacity ${darkCard} ${darkMuted ? 'opacity-50' : ''}`}
      >
        <SwatchOrSamePrimitive
          show={showDarkSwatch}
          hex={dt.serialized.hex}
          label={swD?.label}
          title={`idx ${dt.sourceGlobalIndex}`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-[var(--ns-text)]">{humanizeRole(dt.role)}</p>
          <p className="mt-0.5 font-mono text-[0.65rem] text-[var(--ns-text-muted)]">{dt.name}</p>
          <p className="mt-1 font-mono text-[0.6rem] tabular-nums text-[var(--ns-text-faint)]">idx {dt.sourceGlobalIndex}</p>
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

        const firstLightIdx = new Map<number, number>()
        const firstDarkIdx = new Map<number, number>()
        pairs.forEach((p, i) => {
          if (!firstLightIdx.has(p.light.sourceGlobalIndex)) firstLightIdx.set(p.light.sourceGlobalIndex, i)
          if (!firstDarkIdx.has(p.dark.sourceGlobalIndex)) firstDarkIdx.set(p.dark.sourceGlobalIndex, i)
        })

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
                : 'border-b border-[var(--ns-hairline)]'
            }`}
          >
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ns-text-muted)]">
                {friendlySemanticCategoryLabel(titleKey)}
              </h3>
              {hint ? <p className="mt-1 text-[0.65rem] text-[var(--ns-text-faint)]">{hint}</p> : null}
            </div>
            <div className="space-y-3">
              <div className="mb-1 hidden gap-4 sm:grid sm:grid-cols-2">
                <p className="text-[0.6rem] font-medium uppercase tracking-wide text-[var(--ns-chrome-amber-text)]">Light</p>
                <p className="text-[0.6rem] font-medium uppercase tracking-wide text-[var(--ns-chrome-sky-text)]">
                  Dark elevated
                </p>
              </div>
              {pairs.map((pair, pairIndex) => (
                <PairRow
                  key={pair.light.id}
                  pair={pair}
                  global={global}
                  emphasis={pairEmphasis}
                  showLightSwatch={firstLightIdx.get(pair.light.sourceGlobalIndex) === pairIndex}
                  showDarkSwatch={firstDarkIdx.get(pair.dark.sourceGlobalIndex) === pairIndex}
                />
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
    ? 'border-[var(--ns-chrome-amber-border-medium)] bg-[var(--ns-chrome-amber-surface-soft)] ring-1 ring-[var(--ns-chrome-amber-ring-soft)]'
    : accent === 'sky'
      ? 'border-[var(--ns-chrome-sky-border-medium)] bg-[var(--ns-chrome-sky-surface-soft)] ring-1 ring-[var(--ns-chrome-sky-ring-soft)]'
      : 'border-[var(--ns-hairline)] bg-[var(--ns-surface-raised)]'

const SingleTokenRow = memo(function SingleTokenRow({
  t,
  global,
  accent,
  showSwatch,
}: {
  t: SystemToken
  global: GlobalSwatch[]
  accent?: 'amber' | 'sky'
  showSwatch: boolean
}) {
  const sw = global[t.sourceGlobalIndex]
  return (
    <div className={`flex gap-3 rounded-lg border p-3 ${singleAccentClass(accent)}`}>
      {showSwatch ? (
        <span
          className="h-12 w-12 shrink-0 rounded-lg border border-[var(--ns-hairline-strong)] shadow-inner"
          style={{backgroundColor: t.serialized.hex}}
          title={sw?.label}
        />
      ) : (
        <span
          className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-[var(--ns-hairline-strong)] bg-[var(--ns-overlay-soft)] text-[0.7rem] text-[var(--ns-text-faint)]"
          title={`Same primitive as above · idx ${t.sourceGlobalIndex}`}
          aria-label="Same color swatch as earlier row"
        >
          ↳
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[var(--ns-text)]">{humanizeRole(t.role)}</p>
        <p className="mt-0.5 font-mono text-[0.65rem] text-[var(--ns-text-muted)]">{t.name}</p>
        <p className="mt-1 font-mono text-[0.6rem] tabular-nums text-[var(--ns-text-faint)]">idx {t.sourceGlobalIndex}</p>
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
        const firstRowForSource = new Map<number, number>()
        toks.forEach((t, i) => {
          if (!firstRowForSource.has(t.sourceGlobalIndex)) firstRowForSource.set(t.sourceGlobalIndex, i)
        })
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
                : 'border-b border-[var(--ns-hairline)]'
            }`}
          >
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ns-text-muted)]">
                {friendlySemanticCategoryLabel(titleKey)}
              </h3>
              {hint ? <p className="mt-1 text-[0.65rem] text-[var(--ns-text-faint)]">{hint}</p> : null}
            </div>
            <div className="space-y-3">
              {toks.map((t, rowIndex) => (
                <SingleTokenRow
                  key={t.id}
                  t={t}
                  global={global}
                  accent={accent}
                  showSwatch={firstRowForSource.get(t.sourceGlobalIndex) === rowIndex}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const SemanticSingleThemeGrid = memo(SemanticSingleThemeGridInner)
