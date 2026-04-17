'use client'

import {GlobalScaleStrip} from '@/components/preview/GlobalScaleStrip'
import {SemanticRoleTable} from '@/components/preview/SemanticRoleTable'
import type {GlobalSwatch, SystemToken} from '@/lib/neutral-engine/types'

export type ComparisonLayout = 'split' | 'focus'

type Props = {
  layout: ComparisonLayout
  /** When layout is focus, which theme is shown. */
  focusTheme: 'light' | 'dark'
  global: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
}

/**
 * Light vs Dark Elevated: side-by-side scales + role tables, or single-column focus with parent toggle.
 */
export function PreviewComparison({layout, focusTheme, global, lightTokens, darkTokens}: Props) {
  if (layout === 'focus') {
    const isLight = focusTheme === 'light'
    const tokens = isLight ? lightTokens : darkTokens
    const title = isLight ? 'Light' : 'Dark elevated'
    const caption = isLight
      ? 'Light · global ramp (low index = lightest)'
      : 'Dark elevated · global ramp (high index = canvas / deep surfaces)'
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
              <p className="mt-0.5 text-sm font-medium text-white/90">Neutral system mapping</p>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 font-mono text-[0.6rem] ${
                isLight ? 'bg-amber-500/15 text-amber-100/90' : 'bg-sky-500/15 text-sky-100/90'
              }`}
            >
              {isLight ? 'themeMode: light' : 'themeMode: darkElevated'}
            </span>
          </div>
          <GlobalScaleStrip
            global={global}
            tokens={tokens}
            caption={caption}
            accentClassName={isLight ? 'ring-1 ring-amber-400/20' : 'ring-1 ring-sky-400/20'}
          />
          <div className="mt-4">
            <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-wide text-white/45">
              Semantic roles
            </p>
            <SemanticRoleTable
              tokens={tokens}
              global={global}
              label={`${title} semantic role mapping`}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
      <div className="rounded-xl border border-amber-400/25 bg-amber-500/[0.06] p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="eyebrow">Light</p>
            <p className="mt-0.5 text-sm font-medium text-white/90">Neutral system mapping</p>
          </div>
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-mono text-[0.6rem] text-amber-100/90">
            themeMode: light
          </span>
        </div>
        <GlobalScaleStrip
          global={global}
          tokens={lightTokens}
          caption="Light · global ramp (low index = lightest)"
          accentClassName="ring-1 ring-amber-400/15"
        />
        <div className="mt-4">
          <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-wide text-white/45">
            Semantic roles
          </p>
          <SemanticRoleTable tokens={lightTokens} global={global} label="Light semantic role mapping" />
        </div>
      </div>

      <div className="rounded-xl border border-sky-400/25 bg-sky-500/[0.06] p-3 sm:p-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <p className="eyebrow">Dark elevated</p>
            <p className="mt-0.5 text-sm font-medium text-white/90">Neutral system mapping</p>
          </div>
          <span className="rounded-full bg-sky-500/15 px-2 py-0.5 font-mono text-[0.6rem] text-sky-100/90">
            themeMode: darkElevated
          </span>
        </div>
        <GlobalScaleStrip
          global={global}
          tokens={darkTokens}
          caption="Dark elevated · global ramp (surfaces from dark segment)"
          accentClassName="ring-1 ring-sky-400/15"
        />
        <div className="mt-4">
          <p className="mb-2 text-[0.65rem] font-medium uppercase tracking-wide text-white/45">
            Semantic roles
          </p>
          <SemanticRoleTable
            tokens={darkTokens}
            global={global}
            label="Dark elevated semantic role mapping"
          />
        </div>
      </div>
    </div>
  )
}
