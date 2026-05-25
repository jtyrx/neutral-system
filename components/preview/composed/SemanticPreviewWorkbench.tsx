'use client'

import {memo, useMemo} from 'react'

import type {ComparisonLayout} from '@/components/preview/composed/PreviewComparison'
import {PreviewBlockSection} from '@/components/preview/PreviewBlockSection'
import {
  PREVIEW_BLOCK_CASES,
  type PreviewBlockCase,
} from '@/components/preview/previewBlockRegistry'
import type {TokenSelectTheme} from '@/components/preview/SemanticTokenAnnotation'
import {ThemeComparisonFrame} from '@/components/preview/ThemeComparisonFrame'
import {semanticTokensToStyleVars} from '@/lib/neutral-engine/exportFormats'
import type {GlobalSwatch, NeutralArchitectureMode, TokenView} from '@/lib/neutral-engine'

type Props = {
  neutralArchitecture: NeutralArchitectureMode
  globalLight: GlobalSwatch[]
  globalDark: GlobalSwatch[]
  unifiedGlobal?: GlobalSwatch[] | undefined
  lightTokenView: TokenView
  darkTokenView: TokenView
  liveBrandSurfaceOklch: {light: string; dark: string}
  comparisonLayout: ComparisonLayout
  /** Focus mode selects one theme; split mode shows both. */
  previewTheme: 'light' | 'dark'
  inspectionMode: boolean
  onSelectSystem: (role: string, theme?: TokenSelectTheme) => void
  onChainSelect?: ((blockId: string) => void) | undefined
}

type BlockRowProps = Props & {
  block: PreviewBlockCase
  index: number
  lightThemeVars: React.CSSProperties
  darkThemeVars: React.CSSProperties
}

function BlockRow({
  block,
  index,
  globalLight,
  globalDark,
  lightTokenView,
  darkTokenView,
  liveBrandSurfaceOklch,
  comparisonLayout,
  previewTheme,
  inspectionMode,
  onSelectSystem,
  onChainSelect,
  lightThemeVars,
  darkThemeVars,
}: BlockRowProps) {
  const Case = block.Component
  const lightPane = (
    <Case
      global={globalLight}
      tokenView={lightTokenView}
      brandPlaneOklch={liveBrandSurfaceOklch.light}
      theme="light"
      inspection={inspectionMode}
      onSelectSystem={onSelectSystem}
    />
  )
  const darkPane = (
    <Case
      global={globalDark}
      tokenView={darkTokenView}
      brandPlaneOklch={liveBrandSurfaceOklch.dark}
      theme="darkElevated"
      inspection={inspectionMode}
      onSelectSystem={onSelectSystem}
    />
  )

  const content =
    comparisonLayout === 'split' ? (
      <div className="grid grid-cols-1 gap-20 md:grid-cols-2 md:gap-24">
        <ThemeComparisonFrame theme="light" label="Light" themeVars={lightThemeVars}>
          {lightPane}
        </ThemeComparisonFrame>
        <ThemeComparisonFrame theme="dark" label="Dark elevated" themeVars={darkThemeVars}>
          {darkPane}
        </ThemeComparisonFrame>
      </div>
    ) : (
      <ThemeComparisonFrame
        theme={previewTheme}
        label={previewTheme === 'light' ? 'Light' : 'Dark elevated'}
        themeVars={previewTheme === 'light' ? lightThemeVars : darkThemeVars}
      >
        {previewTheme === 'light' ? lightPane : darkPane}
      </ThemeComparisonFrame>
    )

  return (
    <PreviewBlockSection
      index={index + 1}
      eyebrow={block.eyebrow}
      title={block.title}
      intent={block.intent}
      blockId={block.id}
      hasChainSpec={block.chainSpec != null}
      onChainSelect={onChainSelect}
    >
      {content}
    </PreviewBlockSection>
  )
}

/**
 * Paired Light / Dark elevated preview for every semantic block, following `comparisonLayout`.
 * All annotations route click-to-select through `onSelectSystem` so the right-side Inspector stays in sync.
 */
export const SemanticPreviewWorkbench = memo(function SemanticPreviewWorkbench(props: Props) {
  const lightThemeVars = useMemo(
    () => semanticTokensToStyleVars(props.lightTokenView.sortedForTable),
    [props.lightTokenView],
  )
  const darkThemeVars = useMemo(
    () => semanticTokensToStyleVars(props.darkTokenView.sortedForTable),
    [props.darkTokenView],
  )
  return (
    <div
      className="flex flex-col gap-20"
      data-inspection={props.inspectionMode ? 'on' : 'off'}
    >
      {PREVIEW_BLOCK_CASES.map((block, i) => (
        <BlockRow key={block.id} block={block} index={i} lightThemeVars={lightThemeVars} darkThemeVars={darkThemeVars} {...props} />
      ))}
    </div>
  )
})
SemanticPreviewWorkbench.displayName = 'SemanticPreviewWorkbench'
