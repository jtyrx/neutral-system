'use client'

import {memo, useMemo} from 'react'

import {OklchPickerStandaloneSettings} from '@/components/picker/OklchPickerStandaloneSettings'
import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
import {liveWorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'

const panelStackClassName = 'px-4 pb-12'

/** Architecture -> scale ladders -> OKHSL -> variants -> mapping -> alpha -> export (/picker parity). */
function TunePanelInner() {
  const wb = useNeutralWorkbenchContext()
  const adapter = useMemo(() => liveWorkbenchAdapter(wb), [wb])

  return (
    <div className={panelStackClassName} data-slot="control-center-panel-tune">
      <OklchPickerStandaloneSettings adapter={adapter} />
    </div>
  )
}

export const TunePanel = memo(TunePanelInner)
