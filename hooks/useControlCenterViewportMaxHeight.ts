'use client'

import {useLayoutEffect, useState, type RefObject} from 'react'

/** Breathing room below status / dynamic island; pair with CSS `env(safe-area-inset-top)`. */
const TOP_CLEARANCE_PX = 16

export type ControlCenterViewportBounds = {
  maxHeight: number
  centerX: number
  visualWidth: number
}

/**
 * Returns the raw available viewport space for `#app-dock` content.
 *
 * `maxHeight` is a ceiling — the content-driven max-height is computed in
 * `ControlCenter.tsx` by clamping measured content height to this value.
 * Responds to visual viewport resize, scroll, and window resize events so
 * mobile keyboard appearance and zoom changes are handled correctly.
 */
export function useControlCenterViewportBounds(
  dockShellRef: RefObject<HTMLElement | null>,
): ControlCenterViewportBounds | null {
  const [bounds, setBounds] = useState<ControlCenterViewportBounds | null>(null)

  useLayoutEffect(() => {
    const dock = dockShellRef.current
    if (!dock || typeof window === 'undefined') return undefined

    let rafId = 0
    const vv = window.visualViewport

    const padBottomPx = (): number => {
      const v = parseFloat(globalThis.getComputedStyle(dock).paddingBottom)
      return Number.isFinite(v) ? v : 0
    }

    const update = (): void => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const pb = padBottomPx()
        const visual = window.visualViewport
        if (!visual) {
          const maxHeight = Math.max(
            0,
            Math.floor(window.innerHeight - TOP_CLEARANCE_PX * 2 - pb),
          )
          setBounds({
            maxHeight,
            centerX: Math.floor(window.innerWidth / 2),
            visualWidth: window.innerWidth,
          })
          return
        }

        const maxHeight = Math.max(
          0,
          Math.floor(visual.height - TOP_CLEARANCE_PX - pb),
        )
        setBounds({
          maxHeight,
          centerX: Math.floor(visual.offsetLeft + visual.width / 2),
          visualWidth: Math.floor(visual.width),
        })
      })
    }

    update()
    vv?.addEventListener('resize', update)
    vv?.addEventListener('scroll', update)
    window.addEventListener('resize', update)

    return () => {
      cancelAnimationFrame(rafId)
      vv?.removeEventListener('resize', update)
      vv?.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [dockShellRef])

  return bounds
}
