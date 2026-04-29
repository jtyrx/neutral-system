'use client'

import {memo} from 'react'

import type {ComparisonLayout} from '@/components/preview/PreviewComparison'
import {ContrastPairsPanel} from '@/components/preview/ContrastPairsPanel'
import {PreviewContextPanel} from '@/components/preview/PreviewContextPanel'
import {SemanticPreviewWorkbench} from '@/components/preview/SemanticPreviewWorkbench'
import type {TokenSelectTheme} from '@/components/preview/SemanticTokenAnnotation'
import type {
  GlobalSwatch,
  NeutralArchitectureMode,
  SystemMappingConfig,
  SystemToken,
  TokenView,
} from '@/lib/neutral-engine'

type Props = {
  previewTheme: 'light' | 'dark'
  showContrastPairs: boolean
  neutralArchitecture: NeutralArchitectureMode
  /** Light-theme ramp (Advanced) or unified ramp (Simple — same reference as globalDark when simple). */
  globalLight: GlobalSwatch[]
  /** Dark elevated ramp (Advanced) or unified ramp (Simple). */
  globalDark: GlobalSwatch[]
  /** When Simple Mode, duplicate ref to both ramps — enables semantic blocks to optimize. */
  unifiedGlobal?: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  liveBrandSurfaceOklch: {light: string; dark: string}
  comparisonLayout: ComparisonLayout
  inspectionMode: boolean
  onSelectSystem: (role: string, theme?: TokenSelectTheme) => void
  derivationConfigLight: SystemMappingConfig
  derivationConfigDark: SystemMappingConfig
  ladderLightSteps: number
  ladderDarkSteps: number
  alphaBaseIndices?: {lightBase: number; darkBase: number}
}

function WorkbenchPreviewColumnInner({
  previewTheme,
  showContrastPairs,
  neutralArchitecture,
  globalLight,
  globalDark,
  unifiedGlobal,
  lightTokens,
  darkTokens,
  lightTokenView,
  darkTokenView,
  liveBrandSurfaceOklch,
  comparisonLayout,
  inspectionMode,
  onSelectSystem,
  derivationConfigLight,
  derivationConfigDark,
  ladderLightSteps,
  ladderDarkSteps,
  alphaBaseIndices,
}: Props) {
  return (
    <div className="flex min-h-0 flex-col border-b border-hairline bg-raised transition-opacity duration-200 nsb-lg:border-b-0">
      <div
        id="nsb-preview-blocks"
        aria-label="Semantic preview blocks"
        className="flex flex-col gap-10 px-4 py-6 sm:px-6 sm:py-8 nsb-lg:px-8"
      >
        <section aria-label="Semantic preview blocks" className="mx-auto w-full">
          <SemanticPreviewWorkbench
            neutralArchitecture={neutralArchitecture}
            globalLight={globalLight}
            globalDark={globalDark}
            unifiedGlobal={unifiedGlobal}
            lightTokenView={lightTokenView}
            darkTokenView={darkTokenView}
            liveBrandSurfaceOklch={liveBrandSurfaceOklch}
            comparisonLayout={comparisonLayout}
            previewTheme={previewTheme}
            inspectionMode={inspectionMode}
            onSelectSystem={onSelectSystem}
          />
        </section>

        {showContrastPairs ? (
          <section aria-label="Contrast pairs" className="mx-auto w-full max-w-5xl">
            <ContrastPairsPanel lightTokens={lightTokens} darkTokens={darkTokens} />
          </section>
        ) : null}
      </div>

      <PreviewContextPanel
        neutralArchitecture={neutralArchitecture}
        globalLight={globalLight}
        globalDark={globalDark}
        lightTokenView={lightTokenView}
        darkTokenView={darkTokenView}
        previewTheme={previewTheme}
        comparisonLayout={comparisonLayout}
        derivationConfigLight={derivationConfigLight}
        derivationConfigDark={derivationConfigDark}
        ladderLightSteps={ladderLightSteps}
        ladderDarkSteps={ladderDarkSteps}
        alphaBaseIndices={alphaBaseIndices}
      />
    </div>
  )
}

export const WorkbenchPreviewColumn = memo(WorkbenchPreviewColumnInner)
