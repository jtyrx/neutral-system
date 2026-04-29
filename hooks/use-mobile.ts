import * as React from 'react'

const MOBILE_BREAKPOINT = 768

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
  mql.addEventListener('change', onChange)
  return () => mql.removeEventListener('change', onChange)
}

function getIsMobileSnapshot(): boolean {
  return window.innerWidth < MOBILE_BREAKPOINT
}

/** SSR / prerender: assume desktop until client snapshot runs. */
function getServerSnapshot(): boolean {
  return false
}

export function useIsMobile() {
  return React.useSyncExternalStore(subscribe, getIsMobileSnapshot, getServerSnapshot)
}
