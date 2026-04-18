'use client'

import {memo} from 'react'

import {GlobalRampCard} from '@/components/preview/GlobalRampCard'
import {PairedRolesPanel} from '@/components/preview/PairedRolesPanel'
import type {PairedRoleGroupHints} from '@/components/preview/SemanticPairGrid'
import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'

export type ComparisonLayout = 'split' | 'focus'

type Props = {
  layout: ComparisonLayout
  focusTheme: 'light' | 'dark'
  global: GlobalSwatch[]
  lightTokenView: TokenView
  darkTokenView: TokenView
}

const GROUP_HINTS: PairedRoleGroupHints = {
  surface: 'Base → elevated surfaces (hierarchy ladder; inverse pair is grouped separately).',
  text: 'Content picks follow the text ramp (strongest → weakest) for each theme.',
  inversePair:
    'Contrast-flip: inverse surface and text on inverse — mirror theme hierarchy, not a normal ladder step.',
}

function PreviewComparisonInner({layout, focusTheme, global, lightTokenView, darkTokenView}: Props) {
  if (layout === 'focus') {
    const isLight = focusTheme === 'light'
    const tokenView = isLight ? lightTokenView : darkTokenView
    const title = isLight ? 'Light' : 'Dark elevated'
    const caption = isLight
      ? 'Light · global ramp (low index = lightest)'
      : 'Dark elevated · global ramp (tail-anchored picks)'
    const directionHint = isLight
      ? 'Ramp reads light → dark (low → high index).'
      : 'Surfaces pull from the dark tail; the strip is inverted so it reads dark → light left to right.'

    return (
      <div className="space-y-4">
        <div
          className={`rounded-xl border p-3 sm:p-4 ${
            isLight
              ? 'border-amber-400/25 bg-amber-500/[0.06]'
              : 'border-sky-400/25 bg-sky-500/[0.06]'
          }`}
        >
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="eyebrow">{title}</p>
              <p className="mt-0.5 text-sm font-medium text-white/90">Mapping preview</p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[0.6rem] ${
                isLight ? 'bg-amber-500/15 text-amber-100/90' : 'bg-sky-500/15 text-sky-100/90'
              }`}
            >
              {isLight ? 'themeMode: light' : 'themeMode: darkElevated'}
            </span>
          </div>
          <GlobalRampCard
            id={isLight ? 'light-global-ramp' : 'dark-global-ramp'}
            role="region"
            aria-label={isLight ? 'Light global ramp' : 'Dark elevated global ramp'}
            global={global}
            tokenView={tokenView}
            caption={caption}
            accentClassName={isLight ? 'ring-1 ring-amber-400/20' : 'ring-1 ring-sky-400/20'}
            invertDisplay={!isLight}
            directionHint={directionHint}
          />
          <PairedRolesPanel
            variant="focus"
            focusTheme={focusTheme}
            global={global}
            lightTokenView={lightTokenView}
            darkTokenView={darkTokenView}
            groupHints={GROUP_HINTS}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 lg:grid-cols-1 lg:gap-4">
        <div className="rounded-xl border border-amber-400/25 bg-amber-500/[0.06] p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="eyebrow">Light</p>
              <p className="mt-0.5 text-sm font-medium text-white/90">Global ramp</p>
            </div>
            <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[0.6rem] text-amber-100/90">
              themeMode: light
            </span>
          </div>
          <GlobalRampCard
            id="light-global-ramp"
            role="region"
            aria-label="Light global ramp"
            global={global}
            tokenView={lightTokenView}
            caption="Light · global ramp (low index = lightest)"
            accentClassName="ring-1 ring-amber-400/15"
            directionHint="Ramp reads light → dark (low → high index)."
          />
        </div>

        <div className="rounded-xl border border-sky-400/25 bg-sky-500/[0.06] p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="eyebrow">Dark elevated</p>
              <p className="mt-0.5 text-sm font-medium text-white/90">Global ramp</p>
            </div>
            <span className="rounded-full bg-sky-500/15 px-2 py-0.5 font-mono text-[0.6rem] text-sky-100/90">
              themeMode: darkElevated
            </span>
          </div>
          <GlobalRampCard
            id="dark-global-ramp"
            role="region"
            aria-label="Dark elevated global ramp"
            global={global}
            tokenView={darkTokenView}
            caption="Dark elevated · global ramp (tail pool)"
            accentClassName="ring-1 ring-sky-400/15"
            invertDisplay
            directionHint="Surfaces from the dark tail; strip inverted so it reads dark → light left to right."
          />
        </div>
      </div>

      <PairedRolesPanel
        variant="split"
        global={global}
        lightTokenView={lightTokenView}
        darkTokenView={darkTokenView}
        groupHints={GROUP_HINTS}
      />
    </div>
  )
}

export const PreviewComparison = memo(PreviewComparisonInner)
