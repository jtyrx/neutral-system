'use client'

import dynamic from 'next/dynamic'
import {useSyncExternalStore} from 'react'

import {
  dockElevationDebugEnabled,
  subscribeDockElevationDebug,
} from '@/lib/debug/dockElevationDebug'

const ControlCenterElevationOverlay = dynamic(
  () =>
    import('@/components/control-center/debug/ControlCenterElevationOverlay').then(
      (mod) => mod.ControlCenterElevationOverlay,
    ),
  {ssr: false},
)

export function ControlCenterDebugGate() {
  if (process.env.NODE_ENV !== 'development') return null
  return <ControlCenterDebugGateInner />
}

function ControlCenterDebugGateInner() {
  const show = useSyncExternalStore(
    subscribeDockElevationDebug,
    dockElevationDebugEnabled,
    () => false,
  )
  if (!show) return null
  return <ControlCenterElevationOverlay />
}
