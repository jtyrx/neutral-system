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
  surface:
    'Elevation ladder: sunken → overlay on the ramp; surface.inverse is a dedicated high-contrast flip (grouped separately).',
  text: 'Readable hierarchy: default (primary) down to disabled; text.on is for bold / inverse surfaces.',
  inversePair:
    'Contrast-flip pair: surface.inverse and text.on — ramp mirrors, not normal ladder rungs.',
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
              ? 'border-[var(--ns-chrome-amber-border)] bg-[var(--ns-chrome-amber-surface)]'
              : 'border-[var(--ns-chrome-sky-border)] bg-[var(--ns-chrome-sky-surface)]'
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
                  ? 'bg-[var(--ns-chrome-amber-pill)] text-[var(--ns-chrome-amber-text)]'
                  : 'bg-[var(--ns-chrome-sky-pill)] text-[var(--ns-chrome-sky-text)]'
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
            accentClassName={
              isLight
                ? 'ring-1 ring-[var(--ns-chrome-amber-ring)]'
                : 'ring-1 ring-[var(--ns-chrome-sky-ring)]'
            }
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
        <div className="rounded-xl border border-[var(--ns-chrome-amber-border)] bg-[var(--ns-chrome-amber-surface)] px-4 py-3 sm:px-5 sm:py-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="eyebrow">Light</p>
              <p className="mt-0.5 text-sm font-medium text-default">Global ramp</p>
            </div>
            <span className="rounded-full bg-[var(--ns-chrome-amber-pill)] px-2 py-0.5 font-mono text-[0.6rem] text-[var(--ns-chrome-amber-text)]">
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
            accentClassName="ring-1 ring-[var(--ns-chrome-amber-ring-soft)]"
            directionHint="Ramp reads light → dark (low → high index)."
          />
        </div>

        <div className="rounded-xl border border-[var(--ns-chrome-sky-border)] bg-[var(--ns-chrome-sky-surface)] p-3 sm:p-4">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
            <div>
              <p className="eyebrow">Dark elevated</p>
              <p className="mt-0.5 text-sm font-medium text-default">Global ramp</p>
            </div>
            <span className="rounded-full bg-[var(--ns-chrome-sky-pill)] px-2 py-0.5 font-mono text-[0.6rem] text-[var(--ns-chrome-sky-text)]">
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
            accentClassName="ring-1 ring-[var(--ns-chrome-sky-ring-soft)]"
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
