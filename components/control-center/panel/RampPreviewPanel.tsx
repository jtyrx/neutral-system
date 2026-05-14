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

export type {RampPreviewMode}

type RampPreviewBlockProps = {
  tone: PreviewChromeTone
  effectivePreviewTheme: 'light' | 'dark'
  caption: string
  directionHint: string
  eyebrow: string
  title: string
  badgeLabel: string
}

function RampPreviewBlock({
  tone,
  effectivePreviewTheme,
  caption,
  directionHint,
  eyebrow,
  title,
  badgeLabel,
}: RampPreviewBlockProps) {
  const wb = useNeutralWorkbenchContext()

  const ramp = effectivePreviewTheme === 'light' ? wb.lightRamp : wb.darkRamp
  const tokenView =
    effectivePreviewTheme === 'light' ? wb.lightTokenView : wb.darkTokenView

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

  const alphaBase =
    effectivePreviewTheme === 'light'
      ? wb.alphaBaseIndices.lightBase
      : wb.alphaBaseIndices.darkBase

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
      <div className="cc-ramp-preview-scroll">
        <div className="cc-ramp-preview-stack">
          <RampSwatchRail
            size="panel"
            segmentLabels
            previewThemeOverride={effectivePreviewTheme}
            accentClassName={rampCardAccentClass(tone, 'soft')}
            invertDisplay={invertVisual}
            className="cc-ramp-rail-flush"
          />
          {orderedSegment.length > 0 ? (
            <RampSemanticLanesGrid
              segment={orderedSegment}
              lanesByColumn={lanesByColumn}
              alphaBaseLogicalIndex={alphaBase}
              keyPrefix={`dock-picker-${effectivePreviewTheme}`}
              className="cc-ramp-lanes-flush"
            />
          ) : null}
        </div>
      </div>
      <div className="cc-ramp-preview-footer">
        <p className="cc-ramp-preview-caption">{caption}</p>
        <p className="cc-ramp-preview-hint">{directionHint}</p>
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
        className="cc-ramp-preview-dual"
        data-slot="control-center-ramp-preview-dual"
      >
        <RampPreviewBlock {...dualLightProps} />
        <RampPreviewBlock {...dualDarkProps} />
      </div>
    )
  }

  return <RampPreviewBlock {...singleRampProps} />
}
