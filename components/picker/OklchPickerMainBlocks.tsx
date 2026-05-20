'use client'

import {memo, useCallback} from 'react'

import {OklchControls} from '@/components/picker/OklchControls'
import {OklchGamutSlice} from '@/components/picker/OklchGamutSlice'
import {OklchPreviewSwatch} from '@/components/picker/OklchPreviewSwatch'
import {PickerActions} from '@/components/picker/PickerActions'
import {PickerRampStrip} from '@/components/picker/PickerRampStrip'
import {PickerSecondaryControls} from '@/components/picker/PickerSecondaryControls'
import type {WorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'
import {useDisplayGamut} from '@/hooks/useDisplayGamut'
import {cn} from '@/lib/utils'

/** Main OKLCH actions + sliders + graphs + ramp strip (`/picker` center column). */
type Props = {
  adapter: WorkbenchAdapter
  /** `page`: full picker layout; `embedded`: inspector aside; `dock`: dock picker tab (compact stack). */
  layout: 'page' | 'embedded' | 'dock'
}

function OklchPickerMainBlocksInner({adapter, layout}: Props) {
  const {tier} = useDisplayGamut()

  const simpleArch = adapter.neutralArchitecture === 'simple'
  const activeRampVisual = simpleArch
    ? adapter.global
    : adapter.scaleEditTarget === 'dark'
      ? adapter.darkRamp
      : adapter.lightRamp

  const onSlicePick = useCallback(
    (next: {L: number; C: number}) => {
      adapter.patchPicker(next)
    },
    [adapter],
  )

  const isPage = layout === 'page'
  const isDock = layout === 'dock'
  const sliceW = isPage ? 320 : isDock ? 252 : 280
  const sliceH = isPage ? 240 : isDock ? 168 : 200

  const actionsPickerVariant = layout === 'page' ? 'standalone' : 'embedded'

  const controlsHeading = isPage ? (
    <h2 className="text-xs font-semibold uppercase tracking-wide text-muted">
      OKLCH controls
    </h2>
  ) : (
    <p className="text-xs font-semibold uppercase tracking-wide text-muted">OKLCH controls</p>
  )

  return (
    <>
      <PickerActions
        architecture={adapter.neutralArchitecture}
        globalScale={adapter.globalScale}
        lightScale={adapter.lightScale}
        darkScale={adapter.darkScale}
        pickerOklchCss={adapter.pickerColor.oklchCss}
        adapterMode={adapter.mode}
        variant={actionsPickerVariant}
      />

      <div
        className={cn(
          'grid gap-24',
          isPage ? 'gap-32 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]' : 'grid-cols-1',
        )}
      >
        <div className="space-y-20">
          <section className="space-y-8">
            {controlsHeading}
            <OklchControls
              picker={adapter.picker}
              patchPicker={adapter.patchPicker}
              displayTier={tier}
            />
          </section>
          <PickerSecondaryControls
            secondary={adapter.secondary}
            patchSecondary={adapter.patchSecondary}
          />
        </div>

        <div className="space-y-20">
          <OklchPreviewSwatch
            color={adapter.pickerColor}
            maxChromaInGamut={adapter.maxChromaForPickerLH}
          />
          <OklchGamutSlice
            H={adapter.picker.H}
            picker={adapter.picker}
            displayTier={tier}
            onPick={onSlicePick}
            width={sliceW}
            height={sliceH}
          />
          <PickerRampStrip
            ramp={activeRampVisual}
            caption="Engine ramp (buildGlobalScale · active edit target)"
          />
        </div>
      </div>
    </>
  )
}

export const OklchPickerMainBlocks = memo(OklchPickerMainBlocksInner)
