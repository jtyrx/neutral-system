'use client'

import {memo, useMemo} from 'react'

import {OklchPickerStandaloneSettings} from '@/components/picker/OklchPickerStandaloneSettings'
import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
import {liveWorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'

/** Architecture -> scale ladders -> OKHSL -> variants -> mapping -> alpha -> export (/picker parity). */
function TunePanelInner() {
  const wb = useNeutralWorkbenchContext()
  const adapter = useMemo(() => liveWorkbenchAdapter(wb), [wb])

  return (
    <div className="cc-panel-stack" data-slot="control-center-panel-tune">
      <OklchPickerStandaloneSettings adapter={adapter} />
    </div>
  )
}

export const TunePanel = memo(TunePanelInner)
