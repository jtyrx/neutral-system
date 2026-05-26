'use client'

import {memo, useMemo} from 'react'

import type {ComparisonLayout} from '@/components/preview/composed/PreviewComparison'
import {PreviewBlockSection} from '@/components/preview/PreviewBlockSection'
import {
  previewComparisonSplitClass,
  resolvePreviewBlockSectionLayout,
} from '@/components/preview/previewBlockSectionLayout'
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
  const sectionLayout = resolvePreviewBlockSectionLayout(block.sectionLayout)
  const comparison = sectionLayout.comparison
  const hideLabels = comparison?.hideLabels ?? false
  const frameProps = {
    showLabel: !hideLabels,
    ...(comparison?.frameClassName != null ? {className: comparison.frameClassName} : {}),
    ...(comparison?.frameContentClassName != null
      ? {contentClassName: comparison.frameContentClassName}
      : {}),
  }

  const caseProps = {
    inspection: inspectionMode,
    onSelectSystem,
  } as const

  const lightPane = (
    <Case
      global={globalLight}
      tokenView={lightTokenView}
      brandPlaneOklch={liveBrandSurfaceOklch.light}
      theme="light"
      {...caseProps}
    />
  )
  const darkPane = (
    <Case
      global={globalDark}
      tokenView={darkTokenView}
      brandPlaneOklch={liveBrandSurfaceOklch.dark}
      theme="darkElevated"
      {...caseProps}
    />
  )

  const content =
    comparisonLayout === 'split' ? (
      <div
        className={previewComparisonSplitClass(
          comparison?.splitGap ?? 'default',
          comparison?.splitClassName,
        )}
      >
        <ThemeComparisonFrame theme="light" label="Light" themeVars={lightThemeVars} {...frameProps}>
          {lightPane}
        </ThemeComparisonFrame>
        <ThemeComparisonFrame
          theme="dark"
          label="Dark elevated"
          themeVars={darkThemeVars}
          {...frameProps}
        >
          {darkPane}
        </ThemeComparisonFrame>
      </div>
    ) : (
      <ThemeComparisonFrame
        theme={previewTheme}
        label={previewTheme === 'light' ? 'Light' : 'Dark elevated'}
        themeVars={previewTheme === 'light' ? lightThemeVars : darkThemeVars}
        {...frameProps}
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
      layout={block.sectionLayout}
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
        <BlockRow
          key={block.id}
          block={block}
          index={i}
          lightThemeVars={lightThemeVars}
          darkThemeVars={darkThemeVars}
          {...props}
        />
      ))}
    </div>
  )
})
SemanticPreviewWorkbench.displayName = 'SemanticPreviewWorkbench'
