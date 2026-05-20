'use client'

import {useMemo} from 'react'

import {RampSwatchRail} from '@/components/control-center/ramp/RampSwatchRail'
import {
  PreviewPanelHeading,
  previewChromePanelVariants,
  rampCardAccentClass,
  type PreviewChromeTone,
} from '@/components/preview/previewPanelChrome'
import {
  RampSemanticLanesGrid,
  tokensForSemanticLanes,
} from '@/components/preview/rampSemanticLanes'
import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
import {
  dockPickerRampChromeCopyModel,
  INVERT_DARK_RAMP_STRIP,
} from '@/lib/workbench/rampPreviewCopy'
import type {RampPreviewMode} from '@/lib/workbench/dockPickerStorage'
import type {GlobalSwatch} from '@/lib/neutral-engine/types'
import type {TokenView} from '@/lib/neutral-engine/tokenViews'

export type {RampPreviewMode}

const rampPreviewScrollClassName = 'mt-8 w-full overflow-x-auto'
const rampPreviewStackClassName = 'flex min-w-0 flex-col'
const rampRailFlushClassName = 'rounded-b-none'
const rampLanesFlushClassName =
  '-mt-px rounded-t-none border-t border-t-transparent'
const rampPreviewFooterClassName =
  'mt-8 flex items-center justify-between text-[0.65rem]'
const rampPreviewCaptionClassName =
  'font-medium tracking-normal text-muted'
const rampPreviewHintClassName =
  'leading-[1.375] text-disabled'
const rampPreviewDualClassName = 'flex flex-col gap-12'

type RampPreviewBlockProps = {
  tone: PreviewChromeTone
  effectivePreviewTheme: 'light' | 'dark'
  caption: string
  directionHint: string
  eyebrow: string
  title: string
  badgeLabel: string
  ramp: GlobalSwatch[]
  tokenView: TokenView
  alphaBase: number
}

function RampPreviewBlock({
  tone,
  effectivePreviewTheme,
  caption,
  directionHint,
  eyebrow,
  title,
  badgeLabel,
  ramp,
  tokenView,
  alphaBase,
}: RampPreviewBlockProps) {
  const invertVisual =
    effectivePreviewTheme === 'dark' ? INVERT_DARK_RAMP_STRIP : false

  const orderedSegment = useMemo(() => {
    if (invertVisual) return [...ramp].reverse()
    return ramp
  }, [ramp, invertVisual])

  const lanesByColumn = useMemo(
    () =>
      orderedSegment.map((sw) =>
        tokensForSemanticLanes(tokenView.byGlobalIndex.get(sw.index) ?? []),
      ),
    [orderedSegment, tokenView],
  )

  return (
    <div
      className={previewChromePanelVariants({tone, layout: 'dock'})}
      data-slot="control-center-ramp-preview-block"
      data-tone={tone}
      data-preview-theme={effectivePreviewTheme}
    >
      <PreviewPanelHeading
        eyebrow={eyebrow}
        title={title}
        tone={tone}
        badgeLabel={badgeLabel}
      />
      <div className={rampPreviewScrollClassName}>
        <div className={rampPreviewStackClassName}>
          <RampSwatchRail
            size="panel"
            segmentLabels
            previewThemeOverride={effectivePreviewTheme}
            accentClassName={rampCardAccentClass(tone, 'soft')}
            invertDisplay={invertVisual}
            className={rampRailFlushClassName}
          />
          {orderedSegment.length > 0 ? (
            <RampSemanticLanesGrid
              segment={orderedSegment}
              lanesByColumn={lanesByColumn}
              alphaBaseLogicalIndex={alphaBase}
              keyPrefix={`dock-picker-${effectivePreviewTheme}`}
              className={rampLanesFlushClassName}
            />
          ) : null}
        </div>
      </div>
      <div className={rampPreviewFooterClassName}>
        <p className={rampPreviewCaptionClassName}>{caption}</p>
        <p className={rampPreviewHintClassName}>{directionHint}</p>
      </div>
    </div>
  )
}

export function RampPreviewPanel({
  rampPreviewMode,
}: {
  rampPreviewMode: RampPreviewMode
}) {
  const wb = useNeutralWorkbenchContext()

  const effectivePreviewTheme = useMemo((): 'light' | 'dark' => {
    if (rampPreviewMode === 'light') return 'light'
    if (rampPreviewMode === 'dark') return 'dark'
    return wb.previewTheme === 'dark' ? 'dark' : 'light'
  }, [rampPreviewMode, wb.previewTheme])

  const singleRampProps = useMemo(
    () =>
      dockPickerRampChromeCopyModel({
        neutralArchitecture: wb.neutralArchitecture,
        effectivePreviewTheme,
        swatchCount:
          effectivePreviewTheme === 'light'
            ? wb.lightRamp.length
            : wb.darkRamp.length,
      }),
    [
      effectivePreviewTheme,
      wb.darkRamp.length,
      wb.lightRamp.length,
      wb.neutralArchitecture,
    ],
  )

  const dualLightProps = useMemo(
    () =>
      dockPickerRampChromeCopyModel({
        neutralArchitecture: wb.neutralArchitecture,
        effectivePreviewTheme: 'light',
        swatchCount: wb.lightRamp.length,
      }),
    [wb.lightRamp.length, wb.neutralArchitecture],
  )

  const dualDarkProps = useMemo(
    () =>
      dockPickerRampChromeCopyModel({
        neutralArchitecture: wb.neutralArchitecture,
        effectivePreviewTheme: 'dark',
        swatchCount: wb.darkRamp.length,
      }),
    [wb.darkRamp.length, wb.neutralArchitecture],
  )

  if (rampPreviewMode === 'both') {
    return (
      <div
        className={rampPreviewDualClassName}
        data-slot="control-center-ramp-preview-dual"
      >
        <RampPreviewBlock
          {...dualLightProps}
          ramp={wb.lightRamp}
          tokenView={wb.lightTokenView}
          alphaBase={wb.alphaBaseIndices.lightBase}
        />
        <RampPreviewBlock
          {...dualDarkProps}
          ramp={wb.darkRamp}
          tokenView={wb.darkTokenView}
          alphaBase={wb.alphaBaseIndices.darkBase}
        />
      </div>
    )
  }

  return (
    <RampPreviewBlock
      {...singleRampProps}
      ramp={effectivePreviewTheme === 'light' ? wb.lightRamp : wb.darkRamp}
      tokenView={effectivePreviewTheme === 'light' ? wb.lightTokenView : wb.darkTokenView}
      alphaBase={effectivePreviewTheme === 'light' ? wb.alphaBaseIndices.lightBase : wb.alphaBaseIndices.darkBase}
    />
  )
}
