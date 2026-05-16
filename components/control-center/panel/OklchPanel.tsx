'use client'

import Link from 'next/link'
import {memo, useMemo} from 'react'

import {GamutBadge} from '@/components/picker/GamutBadge'
import {OklchPickerMainBlocks} from '@/components/picker/OklchPickerMainBlocks'
import {Button} from '@/components/ui/button'
import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
import {liveWorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'
import {useDisplayGamut} from '@/hooks/useDisplayGamut'

const panelStackSpacedClassName =
  'flex flex-col gap-4 px-1 pb-3'

const panelCopyClassName =
  'text-[0.65rem] leading-[1.375] text-muted'

const panelLinkClassName =
  'font-medium text-default underline-offset-4 hover:underline'

const panelActionsClassName =
  'flex min-w-0 shrink-0 flex-wrap items-center gap-1.5 sm:gap-2'

/** OKLCH L/C/H sliders, secondary controls, preview swatch, gamut slice, engine ramp strip (live theme). */
function OklchPanelInner() {
  const wb = useNeutralWorkbenchContext()
  const adapter = useMemo(() => liveWorkbenchAdapter(wb), [wb])
  const {tier} = useDisplayGamut()

  return (
    <div className={panelStackSpacedClassName} data-slot="control-center-panel-oklch">
      <p className={panelCopyClassName}>
        Same OKLCH surface as{' '}
        <Link href="/picker" className={panelLinkClassName}>
          /picker
        </Link>{' '}
        (live theme). Ramp strip follows the active edit target.
      </p>
      <div className={panelActionsClassName}>
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
