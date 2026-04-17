'use client'

import {useState} from 'react'

import {PreviewComparison, type ComparisonLayout} from '@/components/preview/PreviewComparison'
import {ThemePreviewControls} from '@/components/workbench/ThemePreviewControls'
import type {GlobalSwatch, SystemToken} from '@/lib/neutral-engine/types'

type Props = {
  global: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
  previewTheme: 'light' | 'dark'
  onPreviewTheme: (t: 'light' | 'dark') => void
  contrastMode: 'compact' | 'wide'
  onContrastMode: (m: 'compact' | 'wide') => void
}

function LayoutToggle({
  layout,
  onLayout,
}: {
  layout: ComparisonLayout
  onLayout: (l: ComparisonLayout) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[0.65rem] font-medium uppercase tracking-wide text-white/45">Compare</span>
      <div className="flex rounded-full border border-white/12 p-0.5">
        <button
          type="button"
          onClick={() => onLayout('split')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
            layout === 'split' ? 'bg-white/15 text-white' : 'text-white/55 hover:text-white/80'
          }`}
          aria-pressed={layout === 'split'}
        >
          Split
        </button>
        <button
          type="button"
          onClick={() => onLayout('focus')}
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
}

/**
 * Sticky preview context: Light vs Dark Elevated comparison with scales + semantic roles.
 */
export function PreviewContextPanel({
  global,
  lightTokens,
  darkTokens,
  previewTheme,
  onPreviewTheme,
  contrastMode,
  onContrastMode,
}: Props) {
  const [layout, setLayout] = useState<ComparisonLayout>('split')

  return (
    <div
      className="sticky top-0 z-30 border-b border-white/10 bg-[oklch(11%_0.025_285_/0.92)] shadow-[0_12px_40px_-12px_oklch(0%_0_0_/0.65)] backdrop-blur-xl supports-[backdrop-filter]:bg-[oklch(11%_0.025_285_/0.88)]"
      role="region"
      aria-label="Preview context — Light versus Dark Elevated comparison"
    >
      <div className="max-h-[min(92dvh,960px)] overflow-y-auto">
        <header className="border-b border-white/10 px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="eyebrow">Preview context</p>
              <h2 className="mt-0.5 text-base font-semibold tracking-tight text-white sm:text-lg">
                Light vs Dark Elevated
              </h2>
              <p className="mt-1 max-w-2xl text-xs text-white/50">
                Full neutral ramp in index order with semantic role mappings. Split compares both
                systems side-by-side; Focus shows one at a time — use the theme toggle. Contrast mode
                affects mapping distance for both themes.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <LayoutToggle layout={layout} onLayout={setLayout} />
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

        <div className="px-4 py-4 sm:px-6 sm:py-5">
          <PreviewComparison
            layout={layout}
            focusTheme={previewTheme}
            global={global}
            lightTokens={lightTokens}
            darkTokens={darkTokens}
          />
        </div>
      </div>
    </div>
  )
}
