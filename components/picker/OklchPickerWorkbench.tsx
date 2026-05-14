'use client'

import {useMemo} from 'react'

import {OklchPickerPanel} from '@/components/picker/OklchPickerPanel'
import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
import {useOklchPickerWorkbench} from '@/hooks/useOklchPickerWorkbench'
import {liveWorkbenchAdapter, sandboxWorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'

export type OklchPickerWorkbenchMode = 'live' | 'sandbox'

function OklchPickerLive() {
  const wb = useNeutralWorkbenchContext()
  const adapter = useMemo(() => liveWorkbenchAdapter(wb), [wb])
  return <OklchPickerPanel adapter={adapter} variant="standalone" />
}

function OklchPickerSandboxStandalone() {
  const sb = useOklchPickerWorkbench()
  const adapter = useMemo(() => sandboxWorkbenchAdapter(sb), [sb])
  return <OklchPickerPanel adapter={adapter} variant="standalone" />
}

export function OklchPickerWorkbench({mode = 'sandbox'}: {mode?: OklchPickerWorkbenchMode}) {
  if (mode === 'live') return <OklchPickerLive />
  return <OklchPickerSandboxStandalone />
}
