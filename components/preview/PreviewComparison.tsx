'use client'

import {memo} from 'react'
import {cva} from 'class-variance-authority'

import {GlobalRampCard} from '@/components/preview/GlobalRampCard'
import {PairedRolesPanel} from '@/components/preview/PairedRolesPanel'
import type {PairedRoleGroupHints} from '@/components/preview/SemanticPairGrid'
import type {GlobalSwatch, NeutralArchitectureMode, TokenView} from '@/lib/neutral-engine'

export type ComparisonLayout = 'split' | 'focus'

type Props = {
  layout: ComparisonLayout
  focusTheme: 'light' | 'dark'
  neutralArchitecture: NeutralArchitectureMode
  globalLight: GlobalSwatch[]
  globalDark: GlobalSwatch[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  alphaBaseIndices?: {lightBase: number; darkBase: number}
}

type ChromeTone = 'amber' | 'sky'

const previewChromePanelVariants = cva('rounded-xl border', {
  variants: {
    tone: {
      amber: 'border-(--chrome-amber-border) bg-(--chrome-amber-surface)',
      sky: 'border-(--chrome-sky-border) bg-(--chrome-sky-surface)',
    },
    layout: {
      focus: 'p-3 sm:p-4',
      splitLight: 'px-3 py-3 sm:px-3.5 sm:py-4',
      splitDark: 'p-3 sm:p-4',
    },
  },
})

const previewThemeBadgeVariants = cva(
  'rounded-full px-2 py-0.5 font-mono text-[0.6rem]',
  {
    variants: {
      tone: {
        amber: 'bg-(--chrome-amber-pill) text-(--chrome-amber-text)',
        sky: 'bg-(--chrome-sky-pill) text-(--chrome-sky-text)',
      },
    },
  },
)

const previewPanelHeaderRowClass =
  'mb-3 flex flex-wrap items-baseline justify-between gap-2'

function rampCardAccentClass(tone: ChromeTone, ring: 'strong' | 'soft') {
  if (tone === 'amber') {
    return ring === 'strong'
      ? 'ring-1 ring-(--chrome-amber-ring)'
      : 'ring-1 ring-(--chrome-amber-ring-soft)'
  }
  return ring === 'strong'
    ? 'ring-1 ring-(--chrome-sky-ring)'
    : 'ring-1 ring-(--chrome-sky-ring-soft)'
}

function PreviewPanelHeading({
  eyebrow,
  title,
  tone,
  badgeLabel,
}: {
  eyebrow: string
  title: string
  tone: ChromeTone
  badgeLabel: string
}) {
  return (
    <div className={previewPanelHeaderRowClass}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <p className="mt-0.5 text-sm font-medium text-default">{title}</p>
      </div>
      <span className={previewThemeBadgeVariants({tone})}>{badgeLabel}</span>
    </div>
  )
}

const GROUP_HINTS: PairedRoleGroupHints = {
  surface:
    'Elevation ladder: sunken → overlay on the ramp; surface.inverse is a dedicated high-contrast flip (grouped separately).',
  text: 'Readable hierarchy: default (primary) down to disabled; text.on is for bold / inverse surfaces.',
  inversePair:
    'Contrast-flip pair: surface.inverse and text.on — ramp mirrors, not normal ladder rungs.',
}

function PreviewComparisonInner({
  layout,
  focusTheme,
  neutralArchitecture,
  globalLight,
  globalDark,
  lightTokenView,
  darkTokenView,
  alphaBaseIndices,
}: Props) {
  const simple = neutralArchitecture === 'simple'
  const invertDarkDisplay = true

  if (layout === 'focus') {
    const isLight = focusTheme === 'light'
    const tokenView = isLight ? lightTokenView : darkTokenView
    const ramp = isLight ? globalLight : globalDark
    const tone: ChromeTone = isLight ? 'amber' : 'sky'
    const title = isLight ? 'Light' : 'Dark elevated'
    const caption = simple
      ? isLight
        ? 'Light · global ramp (low index = lightest)'
        : 'Dark elevated · global ramp (tail-anchored picks)'
      : isLight
        ? 'Light neutral scale (low index = lightest)'
        : 'Dark neutral scale (tail-anchored picks)'
    const directionHint = simple
      ? isLight
        ? 'Ramp reads light → dark (low → high index).'
        : 'Surfaces pull from the dark tail; the strip is inverted so it reads dark → light left to right.'
      : isLight
        ? 'Light sibling ramp reads light → dark (low → high index).'
        : 'Dark sibling ramp reads dark → light — dark-0 is the darkest step.'

    return (
      <div className="space-y-4">
        <div
          className={previewChromePanelVariants({tone, layout: 'focus'})}
        >
          <PreviewPanelHeading
            eyebrow={title}
            title="Mapping preview"
            tone={tone}
            badgeLabel={
              isLight ? 'themeMode: light' : 'themeMode: darkElevated'
            }
          />
          <GlobalRampCard
            id={isLight ? 'light-global-ramp' : 'dark-global-ramp'}
            role="region"
            aria-label={isLight ? 'Light neutral ramp' : 'Dark elevated neutral ramp'}
            global={ramp}
            tokenView={tokenView}
            caption={caption}
            accentClassName={rampCardAccentClass(tone, 'strong')}
            invertDisplay={!isLight ? invertDarkDisplay : undefined}
            directionHint={directionHint}
            alphaBaseIndex={isLight ? alphaBaseIndices?.lightBase : alphaBaseIndices?.darkBase}
          />
          <PairedRolesPanel
            variant="focus"
            focusTheme={focusTheme}
            neutralArchitecture={neutralArchitecture}
            globalLight={globalLight}
            globalDark={globalDark}
            lightTokenView={lightTokenView}
            darkTokenView={darkTokenView}
            groupHints={GROUP_HINTS}
          />
        </div>
      </div>
    )
  }

  const lightCaption = simple ? 'Light · global ramp (low index = lightest)' : 'Light neutral scale (low index = lightest)'
  const darkCaption = simple ? 'Dark elevated · global ramp (dark edge)' : 'Dark neutral scale (dark-0 = darkest)'
  const darkDirSimple =
    'Dark strip is visually inverted to read dark → light left to right; resolved indices remain absolute.'
  const darkDirAdvanced =
    'Dark sibling ramp reads dark → light (low index = darkest); semantic picks anchor from dark-0.'

  return (
    <div className="space-y-8">
      <div className="grid gap-4 nsb-lg:grid-cols-1 nsb-lg:gap-4">
        <div className={previewChromePanelVariants({tone: 'amber', layout: 'splitLight'})}>
          <PreviewPanelHeading
            eyebrow="Light"
            title={simple ? 'Global ramp' : 'Neutral scale'}
            tone="amber"
            badgeLabel="themeMode: light"
          />
          <GlobalRampCard
            id="light-global-ramp"
            role="region"
            aria-label={simple ? 'Light global ramp' : 'Light neutral scale'}
            global={globalLight}
            tokenView={lightTokenView}
            caption={lightCaption}
            accentClassName={rampCardAccentClass('amber', 'soft')}
            directionHint="Ramp reads light → dark (low → high index)."
            alphaBaseIndex={alphaBaseIndices?.lightBase}
          />
        </div>

        <div className={previewChromePanelVariants({tone: 'sky', layout: 'splitDark'})}>
          <PreviewPanelHeading
            eyebrow="Dark elevated"
            title={simple ? 'Global ramp' : 'Neutral scale'}
            tone="sky"
            badgeLabel="themeMode: darkElevated"
          />
          <GlobalRampCard
            id="dark-global-ramp"
            role="region"
            aria-label={simple ? 'Dark elevated global ramp' : 'Dark neutral scale'}
            global={globalDark}
            tokenView={darkTokenView}
            caption={darkCaption}
            accentClassName={rampCardAccentClass('sky', 'soft')}
            invertDisplay={invertDarkDisplay}
            directionHint={simple ? darkDirSimple : darkDirAdvanced}
            alphaBaseIndex={alphaBaseIndices?.darkBase}
          />
        </div>
      </div>

      <PairedRolesPanel
        variant="split"
        neutralArchitecture={neutralArchitecture}
        globalLight={globalLight}
        globalDark={globalDark}
        lightTokenView={lightTokenView}
        darkTokenView={darkTokenView}
        groupHints={GROUP_HINTS}
      />
    </div>
  )
}

export const PreviewComparison = memo(PreviewComparisonInner)
