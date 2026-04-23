'use client'

import { memo } from 'react'

import type { ComparisonLayout } from '@/components/preview/PreviewComparison'
import { ContrastPairsPanel } from '@/components/preview/ContrastPairsPanel'
import { PreviewContextHeader } from '@/components/preview/PreviewContextHeader'
import { PreviewContextPanel } from '@/components/preview/PreviewContextPanel'
import { SemanticPreviewWorkbench } from '@/components/preview/SemanticPreviewWorkbench'
import type { TokenSelectTheme } from '@/components/preview/SemanticTokenAnnotation'
import type {
  ContrastEmphasis,
  GlobalSwatch,
  SystemMappingConfig,
  SystemToken,
  TokenView,
} from '@/lib/neutral-engine'

type Props = {
  previewTheme: 'light' | 'dark'
  showContrastPairs: boolean
  global: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  /** `surface.brand` OKLCH from immediate mapping (no defer) — callout updates with Custom Brand. */
  liveBrandSurfaceOklch: { light: string; dark: string }
  comparisonLayout: ComparisonLayout
  onComparisonLayoutChange: (l: ComparisonLayout) => void
  contrastEmphasis: ContrastEmphasis
  inspectionMode: boolean
  onToggleInspection: () => void
  onSelectSystem: (role: string, theme?: TokenSelectTheme) => void
  /** Mapping + contrast emphasis — matches token derivation and system mapping diagrams. */
  derivationConfig: SystemMappingConfig
  steps: number
}

/**
 * Center column — an inspection-oriented preview workbench.
 *
 * Vertical rhythm: sticky context header → paired semantic blocks → optional contrast matrix → deep inspection tools.
 *
 * Wrapped in `memo` so preset/scale transitions that don't touch preview-relevant props (e.g.
 * `busyInputLabel` rotating) skip the entire center column reconciliation.
 */
function WorkbenchPreviewColumnInner({
  previewTheme,
  showContrastPairs,
  global,
  lightTokens,
  darkTokens,
  lightTokenView,
  darkTokenView,
  liveBrandSurfaceOklch,
  comparisonLayout,
  onComparisonLayoutChange,
  contrastEmphasis,
  inspectionMode,
  onToggleInspection,
  onSelectSystem,
  derivationConfig,
  steps,
}: Props) {
  return (
    <div
      id="preview"
      className="flex min-h-0 flex-col border-b border-hairline bg-raised transition-opacity duration-200 lg:border-b-0"
    >
      <PreviewContextHeader
        comparisonLayout={comparisonLayout}
        previewTheme={previewTheme}
        contrastEmphasis={contrastEmphasis}
        inspectionMode={inspectionMode}
        onToggleInspection={onToggleInspection}
        onComparisonLayoutChange={onComparisonLayoutChange}
      />

      <div
        id="preview-workbench-blocks"
        aria-label="Semantic preview blocks"
        className="flex flex-col gap-10 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
      >
        <section aria-label="Semantic preview blocks" className="mx-auto w-full">
          <SemanticPreviewWorkbench
            global={global}
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

export const WorkbenchPreviewColumn = memo(WorkbenchPreviewColumnInner)
