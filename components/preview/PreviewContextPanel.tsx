'use client'

import {memo, useCallback} from 'react'

import {ContrastSpacingPreview} from '@/components/preview/ContrastSpacingPreview'
import {PreviewComparison, type ComparisonLayout} from '@/components/preview/PreviewComparison'
import {ThemePreviewControls} from '@/components/workbench/ThemePreviewControls'
import type {GlobalSwatch, SystemMappingConfig, TokenView} from '@/lib/neutral-engine'

type Props = {
  global: GlobalSwatch[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  previewTheme: 'light' | 'dark'
  onPreviewTheme: (t: 'light' | 'dark') => void
  contrastMode: 'compact' | 'wide'
  onContrastMode: (m: 'compact' | 'wide') => void
  comparisonLayout: ComparisonLayout
  onComparisonLayout: (l: ComparisonLayout) => void
  systemConfig: SystemMappingConfig
  steps: number
}

const LayoutToggle = memo(function LayoutToggle({
  layout,
  onLayout,
}: {
  layout: ComparisonLayout
  onLayout: (l: ComparisonLayout) => void
}) {
  const onSplit = useCallback(() => onLayout('split'), [onLayout])
  const onFocus = useCallback(() => onLayout('focus'), [onLayout])

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[0.65rem] font-medium uppercase tracking-wide text-white/45">Compare</span>
      <div className="flex rounded-full border border-white/12 p-0.5">
        <button
          type="button"
          onClick={onSplit}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            layout === 'split' ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/80'
          }`}
          aria-pressed={layout === 'split'}
        >
          Split
        </button>
        <button
          type="button"
          onClick={onFocus}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            layout === 'focus' ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/80'
          }`}
          aria-pressed={layout === 'focus'}
        >
          Focus
        </button>
      </div>
    </div>
  )
})

/**
 * Light vs Dark comparison — scrolls with page (not sticky) so the hero mock stays primary.
 */
export function PreviewContextPanel({
  global,
  lightTokenView,
  darkTokenView,
  previewTheme,
  onPreviewTheme,
  contrastMode,
  onContrastMode,
  comparisonLayout,
  onComparisonLayout,
  systemConfig,
  steps,
}: Props) {
  return (
    <div
      className="border-b border-white/10 bg-[oklch(11%_0.025_285_/0.92)] backdrop-blur-xl supports-[backdrop-filter]:bg-[oklch(11%_0.025_285_/0.88)]"
      role="region"
      aria-label="Preview context — Light versus Dark Elevated comparison"
    >
      <div>
        <header className="border-b border-white/10 px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="eyebrow">Compare themes</p>
              <h2 className="mt-0.5 text-base font-semibold tracking-tight text-white sm:text-lg">
                Light vs Dark elevated
              </h2>
              <p className="mt-1 max-w-2xl text-xs text-white/50">
                Ramps and paired roles use the same mapping as exports. Split = both themes; Focus =
                one at a time. Compact / wide changes ladder spacing (see below).
              </p>
              <div className="mt-4 max-w-xl">
                <ContrastSpacingPreview systemConfig={systemConfig} steps={steps} />
              </div>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <LayoutToggle layout={comparisonLayout} onLayout={onComparisonLayout} />
              <ThemePreviewControls
                previewTheme={previewTheme}
                onPreviewTheme={onPreviewTheme}
                contrastMode={contrastMode}
                onContrastMode={onContrastMode}
                dense
              />
            </div>
          </div>
        </header>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <PreviewComparison
            layout={comparisonLayout}
            focusTheme={previewTheme}
            global={global}
            lightTokenView={lightTokenView}
            darkTokenView={darkTokenView}
          />
        </div>
      </div>
    </div>
  )
}
