'use client'

import {motion} from 'motion/react'
import {useMemo, type ReactNode} from 'react'

import {easeSurface} from '@/lib/effects/easings'

export type ControlCenterPanelShellProps = {
  reduceMotionDock: boolean
  /** Outer chrome (border, radius, ring, backdrop) on the dialog root. */
  className?: string
  children: ReactNode
}

const shellBodyClassName =
  'flex min-h-0 max-h-(--cc-viewport-max-height) w-full flex-col bg-default'

/**
 * Dialog surface for the dock picker. The outer app-dock viewport owns height
 * measurement so this shell only animates visual transform.
 */
export function ControlCenterPanelShell({
  reduceMotionDock,
  className,
  children,
}: ControlCenterPanelShellProps) {
  const surfaceMotionTransition = useMemo(() => {
    if (reduceMotionDock) return undefined
    return {duration: 0.22, ease: easeSurface} as const
  }, [reduceMotionDock])

  if (reduceMotionDock) {
    return (
      <div
        data-slot="dock-picker-surface"
        id="dock-picker-surface"
        className={className}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dock-picker-title"
      >
        <div className={shellBodyClassName}>{children}</div>
      </div>
    )
  }

  return (
    <motion.div
      data-slot="dock-picker-surface"
      id="dock-picker-surface"
      className={className}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dock-picker-title"
      style={{
        transformOrigin: '50% 100%',
      }}
      initial={{y: 24, scale: 0.985}}
      animate={{y: 0, scale: 1}}
      transition={surfaceMotionTransition}
    >
      <div className={shellBodyClassName}>{children}</div>
    </motion.div>
  )
}
