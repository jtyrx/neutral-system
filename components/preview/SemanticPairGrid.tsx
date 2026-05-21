import {cva} from 'class-variance-authority'

import {cn} from '@/lib/cn'
import {friendlySemanticCategoryLabel, humanizeRole} from '@/components/preview/previewLabels'
import type {GlobalSwatch, SystemToken, TokenView} from '@/lib/neutral-engine'
import type {SemanticLayer} from '@/lib/neutral-engine/tokenViews'
import {
  tokensForInversePairCategory,
  tokensForSemanticLayerPublicNonInverse,
} from '@/lib/neutral-engine/tokenViews'

const pairCardVariants = cva(
  'flex gap-12 rounded-lg border p-12 transition-opacity',
  {
    variants: {
      chrome: {
        amber:
          'border-(--chrome-amber-border-strong) bg-(--chrome-amber-surface-strong) ring-1 ring-(--chrome-amber-ring)',
        sky: 'border-(--chrome-sky-border-strong) bg-(--chrome-sky-surface-strong) ring-1 ring-(--chrome-sky-ring)',
        none: 'border-hairline bg-raised',
      },
    },
    defaultVariants: {chrome: 'none'},
  },
)

const singleCardVariants = cva(
  'flex gap-12 rounded-lg border p-12',
  {
    variants: {
      accent: {
        amber:
          'border-(--chrome-amber-border-medium) bg-(--chrome-amber-surface-soft) ring-1 ring-(--chrome-amber-ring-soft)',
        sky: 'border-(--chrome-sky-border-medium) bg-(--chrome-sky-surface-soft) ring-1 ring-(--chrome-sky-ring-soft)',
        none: 'border-hairline bg-raised',
      },
    },
    defaultVariants: {accent: 'none'},
  },
)

const sectionGroupVariants = cva(
  'space-y-12 pb-40 last:pb-0',
  {
    variants: {
      kind: {
        inverse:
          'rounded-xl border border-(--color-surface-inverse)/15 bg-(--color-surface-inverse)/4 p-16',
        layer: 'border-b border-hairline',
      },
    },
  },
)

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
  globalLight: GlobalSwatch[]
  globalDark: GlobalSwatch[]
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
        className="h-48 w-48 shrink-0 rounded-lg border border-hairline-strong shadow-inner"
        style={{backgroundColor: hex}}
        title={label}
      />
    )
  }
  return (
    <span
      className="inline-flex h-48 w-48 shrink-0 items-center justify-center rounded-lg border border-dashed border-hairline-strong bg-overlay-soft text-nano text-disabled"
      title={`Same primitive as above · ${title}`}
      aria-label="Same color swatch as earlier row"
    >
      ↳
    </span>
  )
}

function PairRow({
  pair,
  globalLight,
  globalDark,
  emphasis,
  showLightSwatch,
  showDarkSwatch,
}: PairRowProps) {
  const {light: lt, dark: dt} = pair
  const swL = globalLight[lt.sourceGlobalIndex]
  const swD = globalDark[dt.sourceGlobalIndex]

  const lightMuted = emphasis === 'dark'
  const darkMuted = emphasis === 'light'

  return (
    <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 sm:gap-16">
      <div
        className={cn(
          pairCardVariants({chrome: emphasis === 'light' ? 'amber' : 'none'}),
          lightMuted && 'opacity-50',
        )}
      >
        <SwatchOrSamePrimitive
          show={showLightSwatch}
          hex={lt.serialized.hex}
          label={swL?.label}
          title={`idx ${lt.sourceGlobalIndex}`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-default">{humanizeRole(lt.role)}</p>
          <p className="mt-2 font-mono text-micro text-muted">{lt.name}</p>
          <p className="mt-4 font-mono text-nano tabular-nums text-disabled">idx {lt.sourceGlobalIndex}</p>
        </div>
      </div>
      <div
        className={cn(
          pairCardVariants({chrome: emphasis === 'dark' ? 'sky' : 'none'}),
          darkMuted && 'opacity-50',
        )}
      >
        <SwatchOrSamePrimitive
          show={showDarkSwatch}
          hex={dt.serialized.hex}
          label={swD?.label}
          title={`idx ${dt.sourceGlobalIndex}`}
        />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-default">{humanizeRole(dt.role)}</p>
          <p className="mt-2 font-mono text-micro text-muted">{dt.name}</p>
          <p className="mt-4 font-mono text-nano tabular-nums text-disabled">idx {dt.sourceGlobalIndex}</p>
        </div>
      </div>
    </div>
  )
}

type Props = {
  lightTokenView: TokenView
  darkTokenView: TokenView
  globalLight: GlobalSwatch[]
  globalDark: GlobalSwatch[]
  /** Optional notes under each layer group (e.g. text ramp) and the Inverse category. */
  groupHints?: PairedRoleGroupHints | undefined
  /** Section order; default separates inverse roles into their own category. */
  pairSections?: readonly PairSection[] | undefined
  /** Highlight Light column, Dark column, or balance both. */
  pairEmphasis?: PairEmphasis | undefined
}

/**
 * Side-by-side Light | Dark rows, paired by token name within each semantic layer.
 */
export function SemanticPairGrid({
  lightTokenView,
  darkTokenView,
  globalLight,
  globalDark,
  groupHints,
  pairSections = DEFAULT_PAIR_SECTIONS,
  pairEmphasis = 'both',
}: Props) {
  return (
    <div className="space-y-40">
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
        return (
          <div
            key={section.kind === 'inverse' ? 'inverse' : section.layer}
            className={sectionGroupVariants({kind: section.kind})}
          >
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {friendlySemanticCategoryLabel(titleKey)}
              </h3>
              {hint ? <p className="mt-4 text-micro text-disabled">{hint}</p> : null}
            </div>
            <div className="space-y-12">
              <div className="mb-4 hidden gap-16 sm:grid sm:grid-cols-2">
                <p className="text-nano font-medium uppercase tracking-wide text-(--chrome-amber-text)">Light</p>
                <p className="text-nano font-medium uppercase tracking-wide text-(--chrome-sky-text)">
                  Dark elevated
                </p>
              </div>
              {pairs.map((pair, pairIndex) => (
                <PairRow
                  key={pair.light.id}
                  pair={pair}
                  globalLight={globalLight}
                  globalDark={globalDark}
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
SemanticPairGrid.displayName = 'SemanticPairGrid'

function SingleTokenRow({
  t,
  global,
  accent,
  showSwatch,
}: {
  t: SystemToken
  global: GlobalSwatch[]
  accent?: 'amber' | 'sky' | undefined
  showSwatch: boolean
}) {
  const sw = global[t.sourceGlobalIndex]
  return (
    <div className={singleCardVariants({accent})}>
      {showSwatch ? (
        <span
          className="h-48 w-48 shrink-0 rounded-lg border border-hairline-strong shadow-inner"
          style={{backgroundColor: t.serialized.hex}}
          title={sw?.label}
        />
      ) : (
        <span
          className="inline-flex h-48 w-48 shrink-0 items-center justify-center rounded-lg border border-dashed border-hairline-strong bg-overlay-soft text-nano text-disabled"
          title={`Same primitive as above · idx ${t.sourceGlobalIndex}`}
          aria-label="Same color swatch as earlier row"
        >
          ↳
        </span>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-default">{humanizeRole(t.role)}</p>
        <p className="mt-2 font-mono text-micro text-muted">{t.name}</p>
        <p className="mt-4 font-mono text-nano tabular-nums text-disabled">idx {t.sourceGlobalIndex}</p>
      </div>
    </div>
  )
}

type SingleProps = {
  tokenView: TokenView
  global: GlobalSwatch[]
  groupHints?: PairedRoleGroupHints | undefined
  pairSections?: readonly PairSection[] | undefined
  /** Match preview column chrome (Light = amber, Dark = sky). */
  themeChrome?: 'light' | 'dark' | undefined
}

/** One theme only — Focus layout. */
export function SemanticSingleThemeGrid({
  tokenView,
  global,
  groupHints,
  pairSections = DEFAULT_PAIR_SECTIONS,
  themeChrome,
}: SingleProps) {
  const accent = themeChrome === 'light' ? 'amber' : themeChrome === 'dark' ? 'sky' : undefined
  return (
    <div className="space-y-40">
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
        return (
          <div
            key={section.kind === 'inverse' ? 'inverse' : section.layer}
            className={sectionGroupVariants({kind: section.kind})}
          >
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                {friendlySemanticCategoryLabel(titleKey)}
              </h3>
              {hint ? <p className="mt-4 text-micro text-disabled">{hint}</p> : null}
            </div>
            <div className="space-y-12">
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
SemanticSingleThemeGrid.displayName = 'SemanticSingleThemeGrid'
