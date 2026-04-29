import * as React from 'react'

const QUERY = '(hover: hover) and (pointer: fine)'

/**
 * True when the primary input supports hover tooltips (fine pointer + hover capability).
 * False during SSR — avoids flash of tooltip chrome on touch-first devices.
 */
export function useFinePointerHover(): boolean {
  return React.useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => {}
      const mq = window.matchMedia(QUERY)
      mq.addEventListener('change', onStoreChange)
      return () => mq.removeEventListener('change', onStoreChange)
    },
    () => window.matchMedia(QUERY).matches,
    () => false,
  )
}
