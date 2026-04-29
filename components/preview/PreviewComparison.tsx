'use client'

import {memo} from 'react'

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
  const invertDarkDisplay = simple

  if (layout === 'focus') {
    const isLight = focusTheme === 'light'
    const tokenView = isLight ? lightTokenView : darkTokenView
    const ramp = isLight ? globalLight : globalDark
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
        : 'Dark sibling ramp reads light → dark — independent optical scale.'

    return (
      <div className="space-y-4">
        <div
          className={`rounded-xl border p-3 sm:p-4 ${
            isLight
              ? 'border-(--chrome-amber-border) bg-(--chrome-amber-surface)'
              : 'border-(--chrome-sky-border) bg-(--chrome-sky-surface)'
          }`}
        >
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="eyebrow">{title}</p>
              <p className="mt-0.5 text-sm font-medium text-default">Mapping preview</p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[0.6rem] ${
                isLight
                  ? 'bg-(--chrome-amber-pill) text-(--chrome-amber-text)'
                  : 'bg-(--chrome-sky-pill) text-(--chrome-sky-text)'
              }`}
            >
              {isLight ? 'themeMode: light' : 'themeMode: darkElevated'}
            </span>
          </div>
          <GlobalRampCard
            id={isLight ? 'light-global-ramp' : 'dark-global-ramp'}
            role="region"
            aria-label={isLight ? 'Light neutral ramp' : 'Dark elevated neutral ramp'}
            global={ramp}
            tokenView={tokenView}
            caption={caption}
            accentClassName={
              isLight ? 'ring-1 ring-[var(--chrome-amber-ring)]' : 'ring-1 ring-[var(--chrome-sky-ring)]'
            }
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
  const darkCaption = simple ? 'Dark elevated · global ramp (dark edge)' : 'Dark neutral scale (dark edge)'
  const darkDirSimple =
    'Dark strip is visually inverted to read dark → light left to right; resolved indices remain absolute.'
  const darkDirAdvanced =
    'Dark sibling ramp reads light→dark along indices; semantic picks anchor from the dark tail.'

  return (
    <div className="space-y-8">
      <div className="grid gap-4 nsb-lg:grid-cols-1 nsb-lg:gap-4">
        <div className="rounded-xl border border-(--chrome-amber-border) bg-(--chrome-amber-surface) px-3 py-3 sm:px-3.5 sm:py-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="eyebrow">Light</p>
              <p className="mt-0.5 text-sm font-medium text-default">
                {simple ? 'Global ramp' : 'Neutral scale'}
              </p>
            </div>
            <span className="rounded-full bg-(--chrome-amber-pill) px-2 py-0.5 font-mono text-[0.6rem] text-(--chrome-amber-text)">
              themeMode: light
            </span>
          </div>
          <GlobalRampCard
            id="light-global-ramp"
            role="region"
            aria-label={simple ? 'Light global ramp' : 'Light neutral scale'}
            global={globalLight}
            tokenView={lightTokenView}
            caption={lightCaption}
            accentClassName="ring-1 ring-[var(--chrome-amber-ring-soft)]"
            directionHint="Ramp reads light → dark (low → high index)."
            alphaBaseIndex={alphaBaseIndices?.lightBase}
          />
        </div>

        <div className="rounded-xl border border-(--chrome-sky-border) bg-(--chrome-sky-surface) p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="eyebrow">Dark elevated</p>
              <p className="mt-0.5 text-sm font-medium text-default">
                {simple ? 'Global ramp' : 'Neutral scale'}
              </p>
            </div>
            <span className="rounded-full bg-(--chrome-sky-pill) px-2 py-0.5 font-mono text-[0.6rem] text-(--chrome-sky-text)">
              themeMode: darkElevated
            </span>
          </div>
          <GlobalRampCard
            id="dark-global-ramp"
            role="region"
            aria-label={simple ? 'Dark elevated global ramp' : 'Dark neutral scale'}
            global={globalDark}
            tokenView={darkTokenView}
            caption={darkCaption}
            accentClassName="ring-1 ring-[var(--chrome-sky-ring-soft)]"
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
