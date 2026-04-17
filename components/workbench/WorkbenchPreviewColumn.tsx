'use client'

import {PreviewContextPanel} from '@/components/preview/PreviewContextPanel'
import {PreviewSection} from '@/components/sections/PreviewSection'
import type {GlobalSwatch, SystemToken} from '@/lib/neutral-engine/types'

type Props = {
  previewTheme: 'light' | 'dark'
  onPreviewTheme: (t: 'light' | 'dark') => void
  contrastMode: 'compact' | 'wide'
  onContrastMode: (m: 'compact' | 'wide') => void
  global: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
  /** Active theme tokens for the UI mock below. */
  tokens: SystemToken[]
}

/**
 * Preview column: sticky Light vs Dark Elevated comparison, then scrollable UI mock.
 */
export function WorkbenchPreviewColumn({
  previewTheme,
  onPreviewTheme,
  contrastMode,
  onContrastMode,
  global,
  lightTokens,
  darkTokens,
  tokens,
}: Props) {
  return (
    <div
      id="preview"
      className="ns-workbench__preview flex min-h-0 flex-col border-b border-white/10 bg-black/10"
    >
      <PreviewContextPanel
        global={global}
        lightTokens={lightTokens}
        darkTokens={darkTokens}
        previewTheme={previewTheme}
        onPreviewTheme={onPreviewTheme}
        contrastMode={contrastMode}
        onContrastMode={onContrastMode}
      />

      <div className="border-t border-white/10 bg-black/5">
        <div className="px-4 py-4 sm:px-6">
          <p className="eyebrow">UI mock</p>
          <h2 className="mt-1 text-base font-semibold tracking-tight text-white">Surfaces in context</h2>
          <p className="mt-1 max-w-2xl text-xs text-white/45">
            Mock layout using the theme selected in the sticky toolbar (Light or Dark elevated). The
            comparison panel above always shows both mappings when Split is on.
          </p>
        </div>
        <div className="px-4 pb-8 sm:px-6 lg:px-8">
          <PreviewSection previewTheme={previewTheme} global={global} tokens={tokens} hero />
        </div>
      </div>
    </div>
  )
}
