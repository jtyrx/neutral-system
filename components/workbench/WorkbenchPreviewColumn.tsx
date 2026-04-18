'use client'

import type {ComparisonLayout} from '@/components/preview/PreviewComparison'
import {ContrastPairsPanel} from '@/components/preview/ContrastPairsPanel'
import {DualThemeAppShell} from '@/components/preview/DualThemeAppShell'
import {PreviewContextPanel} from '@/components/preview/PreviewContextPanel'
import type {GlobalSwatch, SystemMappingConfig, SystemToken, TokenView} from '@/lib/neutral-engine'

type Props = {
  previewTheme: 'light' | 'dark'
  showContrastPairs: boolean
  global: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  comparisonLayout: ComparisonLayout
  /** Mapping + contrast emphasis — matches token derivation and system mapping diagrams. */
  derivationConfig: SystemMappingConfig
  steps: number
}

/**
 * Center column: dual-theme app shell (hero), optional contrast matrix, then deep inspection tools.
 */
export function WorkbenchPreviewColumn({
  previewTheme,
  showContrastPairs,
  global,
  lightTokens,
  darkTokens,
  lightTokenView,
  darkTokenView,
  comparisonLayout,
  derivationConfig,
  steps,
}: Props) {
  return (
    <div
      id="preview"
      className="flex min-h-0 flex-col border-b border-white/10 bg-black/10 transition-opacity duration-200 lg:border-b-0"
    >
      <div className="border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="mx-auto max-w-full">
          <p className="eyebrow">Live preview</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">
            Role-based neutral UI
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/50">
            Shared OKLCH ramp · Light maps from the light end, Dark elevated from the tail. Inverse
            surfaces mirror base across the ladder.
          </p>
        </header>
        <div className="mx-auto mt-8 max-w-full transition-all duration-300 ease-out">
          <DualThemeAppShell global={global} lightTokenView={lightTokenView} darkTokenView={darkTokenView} />
        </div>
        {showContrastPairs ? (
          <div className="mx-auto mt-8 max-w-6xl transition-opacity duration-300">
            <ContrastPairsPanel lightTokens={lightTokens} darkTokens={darkTokens} />
          </div>
        ) : null}
      </div>

      <PreviewContextPanel
        global={global}
        lightTokenView={lightTokenView}
        darkTokenView={darkTokenView}
        previewTheme={previewTheme}
        comparisonLayout={comparisonLayout}
        derivationConfig={derivationConfig}
        steps={steps}
      />
    </div>
  )
}
