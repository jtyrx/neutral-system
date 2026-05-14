/**
 * Dock elevation / progressive-blur dev instrumentation (dev-only).
 *
 * Opt-in mirrors `presetDebug`: `?dockElevationDebug=1`, `localStorage ns:dockElevationDebug`,
 * or `window.__NS_DOCK_ELEVATION_DEBUG__`. Hard-gated to `NODE_ENV === 'development'`.
 */

export const DOCK_ELEVATION_DEBUG_STORAGE_KEY = 'ns:dockElevationDebug'

export const DOCK_ELEVATION_DEBUG_CHANGE_EVENT = 'ns:dock-elevation-debug-change'

type DockElevationDebugWindow = Window & {
  __NS_DOCK_ELEVATION_DEBUG__?: boolean
}

function w(): DockElevationDebugWindow | null {
  return typeof window === 'undefined' ? null : (window as DockElevationDebugWindow)
}

/** Subscribe for `useSyncExternalStore` / UI that mirrors opt-in (same-tab + other tabs). */
export function subscribeDockElevationDebug(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {}
  const run = () => onStoreChange()
  window.addEventListener('storage', run)
  window.addEventListener(DOCK_ELEVATION_DEBUG_CHANGE_EVENT, run)
  return () => {
    window.removeEventListener('storage', run)
    window.removeEventListener(DOCK_ELEVATION_DEBUG_CHANGE_EVENT, run)
  }
}

export function notifyDockElevationDebugChanged() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(DOCK_ELEVATION_DEBUG_CHANGE_EVENT))
}

/** Persist opt-in from Settings; does not clear URL flags. */
export function setDockElevationDebugOptIn(enabled: boolean) {
  if (typeof window === 'undefined') return
  try {
    if (enabled) localStorage.setItem(DOCK_ELEVATION_DEBUG_STORAGE_KEY, '1')
    else localStorage.removeItem(DOCK_ELEVATION_DEBUG_STORAGE_KEY)
  } catch {
    /* ignore */
  }
  notifyDockElevationDebugChanged()
}

/** Toggle localStorage `ns:dockElevationDebug` (dev no-op in production). */
export function toggleDockElevationDebugOptIn() {
  if (process.env.NODE_ENV !== 'development') return
  const win = w()
  if (!win) return
  try {
    const on = win.localStorage.getItem(DOCK_ELEVATION_DEBUG_STORAGE_KEY) === '1'
    setDockElevationDebugOptIn(!on)
  } catch {
    setDockElevationDebugOptIn(true)
  }
}

export function dockElevationDebugEnabled(): boolean {
  if (process.env.NODE_ENV !== 'development') return false
  const win = w()
  if (!win) return false
  try {
    if (new URLSearchParams(win.location.search).get('dockElevationDebug') === '1') {
      return true
    }
  } catch {
    /* ignore */
  }
  try {
    if (win.localStorage.getItem(DOCK_ELEVATION_DEBUG_STORAGE_KEY) === '1')
      return true
  } catch {
    /* ignore */
  }
  return win.__NS_DOCK_ELEVATION_DEBUG__ === true
}
