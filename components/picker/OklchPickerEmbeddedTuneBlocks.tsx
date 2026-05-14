'use client'

import {memo} from 'react'

import {GlobalScaleSection} from '@/components/sections/GlobalScaleSection'
import {OkhslSectionBlock} from '@/components/picker/OkhslSectionBlock'
import {useOklchPickerSectionProps} from '@/hooks/useOklchPickerSectionProps'
import type {WorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'

/** Embedded inspector tail — ladder section + OKHSL (parity with previous `embedded` picker panel). */
function OklchPickerEmbeddedTuneBlocksInner({adapter}: {adapter: WorkbenchAdapter}) {
  const {globalScaleSectionProps} = useOklchPickerSectionProps(adapter)

  return (
    <div className="space-y-6 picker-section-divider">
      <GlobalScaleSection {...globalScaleSectionProps} />

      <OkhslSectionBlock
        adapter={adapter}
        id="nsb-picker-embedded-okhsl"
      />
    </div>
  )
}

export const OklchPickerEmbeddedTuneBlocks = memo(OklchPickerEmbeddedTuneBlocksInner)
