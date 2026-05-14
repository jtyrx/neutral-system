'use client'

import Link from 'next/link'
import {memo, useMemo} from 'react'

import {GamutBadge} from '@/components/picker/GamutBadge'
import {OklchPickerMainBlocks} from '@/components/picker/OklchPickerMainBlocks'
import {Button} from '@/components/ui/button'
import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
import {liveWorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'
import {useDisplayGamut} from '@/hooks/useDisplayGamut'

/** OKLCH L/C/H sliders, secondary controls, preview swatch, gamut slice, engine ramp strip (live theme). */
function OklchPanelInner() {
  const wb = useNeutralWorkbenchContext()
  const adapter = useMemo(() => liveWorkbenchAdapter(wb), [wb])
  const {tier} = useDisplayGamut()

  return (
    <div className="cc-panel-stack-spaced" data-slot="control-center-panel-oklch">
      <p className="cc-panel-copy">
        Same OKLCH surface as{' '}
        <Link href="/picker" className="cc-panel-link">
          /picker
        </Link>{' '}
        (live theme). Ramp strip follows the active edit target.
      </p>
      <div className="cc-panel-actions flex-wrap">
        <GamutBadge tier={tier} />
        <Button type="button" variant="outline" size="sm" onClick={adapter.resetToDefaults}>
          Reset
        </Button>
      </div>
      <OklchPickerMainBlocks adapter={adapter} layout="dock" />
    </div>
  )
}

export const OklchPanel = memo(OklchPanelInner)
