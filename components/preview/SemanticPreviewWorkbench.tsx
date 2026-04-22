'use client'

import {memo} from 'react'

import type {ComparisonLayout} from '@/components/preview/PreviewComparison'
import {PreviewBlockSection} from '@/components/preview/PreviewBlockSection'
import {
  PREVIEW_BLOCK_CASES,
  type PreviewBlockCase,
} from '@/components/preview/SemanticPreviewBlockCases'
import type {TokenSelectTheme} from '@/components/preview/SemanticTokenAnnotation'
import {ThemeComparisonFrame} from '@/components/preview/ThemeComparisonFrame'
import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'

type Props = {
  global: GlobalSwatch[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  liveBrandSurfaceOklch: {light: string; dark: string}
  comparisonLayout: ComparisonLayout
  /** Focus mode selects one theme; split mode shows both. */
  previewTheme: 'light' | 'dark'
  inspectionMode: boolean
  onSelectSystem: (role: string, theme?: TokenSelectTheme) => void
}

type BlockRowProps = Props & {block: PreviewBlockCase; index: number}

function BlockRow({
  block,
  index,
  global,
  lightTokenView,
  darkTokenView,
  liveBrandSurfaceOklch,
  comparisonLayout,
  previewTheme,
  inspectionMode,
  onSelectSystem,
}: BlockRowProps) {
  const Case = block.Component
  const lightPane = (
    <Case
      global={global}
      tokenView={lightTokenView}
      brandPlaneOklch={liveBrandSurfaceOklch.light}
      theme="light"
      inspection={inspectionMode}
      onSelectSystem={onSelectSystem}
    />
  )
  const darkPane = (
    <Case
      global={global}
      tokenView={darkTokenView}
      brandPlaneOklch={liveBrandSurfaceOklch.dark}
      theme="darkElevated"
      inspection={inspectionMode}
      onSelectSystem={onSelectSystem}
    />
  )

  const content =
    comparisonLayout === 'split' ? (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
        <ThemeComparisonFrame theme="light" label="Light">
          {lightPane}
        </ThemeComparisonFrame>
        <ThemeComparisonFrame theme="dark" label="Dark elevated">
          {darkPane}
        </ThemeComparisonFrame>
      </div>
    ) : (
      <ThemeComparisonFrame
        theme={previewTheme}
        label={previewTheme === 'light' ? 'Light' : 'Dark elevated'}
      >
        {previewTheme === 'light' ? lightPane : darkPane}
      </ThemeComparisonFrame>
    )

  return (
    <PreviewBlockSection index={index + 1} eyebrow={block.eyebrow} title={block.title} intent={block.intent}>
      {content}
    </PreviewBlockSection>
  )
}

/**
 * Paired Light / Dark elevated preview for every semantic block, following `comparisonLayout`.
 * All annotations route click-to-select through `onSelectSystem` so the right-side Inspector stays in sync.
 */
export const SemanticPreviewWorkbench = memo(function SemanticPreviewWorkbench(props: Props) {
  return (
    <div
      className="flex flex-col gap-5"
      data-inspection={props.inspectionMode ? 'on' : 'off'}
    >
      {PREVIEW_BLOCK_CASES.map((block, i) => (
        <BlockRow key={block.id} block={block} index={i} {...props} />
      ))}
    </div>
  )
})
