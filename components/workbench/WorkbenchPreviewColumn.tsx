'use client'

import type {ComparisonLayout} from '@/components/preview/PreviewComparison'
import {PreviewContextPanel} from '@/components/preview/PreviewContextPanel'
import {PreviewSection} from '@/components/sections/PreviewSection'
import type {GlobalSwatch, SystemMappingConfig, TokenView} from '@/lib/neutral-engine'

type Props = {
  previewTheme: 'light' | 'dark'
  onPreviewTheme: (t: 'light' | 'dark') => void
  contrastMode: 'compact' | 'wide'
  onContrastMode: (m: 'compact' | 'wide') => void
  global: GlobalSwatch[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  activeTokenView: TokenView
  comparisonLayout: ComparisonLayout
  onComparisonLayout: (l: ComparisonLayout) => void
  /** Raw system mapping for contrast-spacing illustration. */
  systemConfig: SystemMappingConfig
  /** Ramp length for spacing preview (matches global ladder). */
  steps: number
}

/**
 * Preview column: **UI mock first** (hero), then Light vs Dark comparison (supporting context).
 */
export function WorkbenchPreviewColumn({
  previewTheme,
  onPreviewTheme,
  contrastMode,
  onContrastMode,
  global,
  lightTokenView,
  darkTokenView,
  activeTokenView,
  comparisonLayout,
  onComparisonLayout,
  systemConfig,
  steps,
}: Props) {
  return (
    <div
      id="preview"
      className="ns-workbench__preview flex min-h-0 flex-col border-b border-white/10 bg-black/10"
    >
      {/* Hero: primary output of the builder */}
      <div className="border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent px-4 py-6 sm:px-6 sm:py-8 lg:px-10">
        <header className="mx-auto max-w-4xl">
          <p className="eyebrow">Live output</p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-white sm:text-xl">
            Surfaces in context
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-white/50">
            Six surface steps and five content tones from the active theme, composed as a real UI
            shell. Use the toolbar (mobile) or preview panel below to switch Light / Dark elevated.
          </p>
        </header>
        <div className="mx-auto mt-6 max-w-5xl">
          <PreviewSection previewTheme={previewTheme} global={global} tokenView={activeTokenView} hero />
        </div>
      </div>

      <PreviewContextPanel
        global={global}
        lightTokenView={lightTokenView}
        darkTokenView={darkTokenView}
        previewTheme={previewTheme}
        onPreviewTheme={onPreviewTheme}
        contrastMode={contrastMode}
        onContrastMode={onContrastMode}
        comparisonLayout={comparisonLayout}
        onComparisonLayout={onComparisonLayout}
        systemConfig={systemConfig}
        steps={steps}
      />
    </div>
  )
}
