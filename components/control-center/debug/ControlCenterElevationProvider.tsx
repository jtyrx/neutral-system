'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'

import type {PageProgressiveBlurDirection} from '@/components/ui/page-progressive-blur.tsx'
import type {BlurCurve} from '@/lib/effects/progressiveBlurStack'

export type PageBlurTuning = {
  enabled: boolean
  direction: PageProgressiveBlurDirection
  layerCount: number
  maxBlurPx: number
  featherPx: number
  curve: BlurCurve
  tension: number
  radius: string
  /** Tint wash over page blur (0–28, background mix percent). */
  tintOpacityPercent: number
}

export type HaloTuning = {
  enabled: boolean
  spread: number
  layerCount: number
  maxBlurPx: number
  bias: 'bottom' | 'uniform'
  softness: number
  tension: number
  curve: BlurCurve
}

export type DockChromeTuning = {
  enabled: boolean
  shadowOffsetY: number
  shadowBlur: number
  shadowSpread: number
  shadowOpacity: number
  /** 0–100 — `color-mix` against `--color-surface-overlay`. */
  surfaceMixPercent: number
  /** Ring / hairline strength 0–100. */
  ringOpacityPercent: number
}

export type PopupHaloTuning = {
  enabled: boolean
  spread: number
  layerCount: number
  maxBlurPx: number
  bias: 'bottom' | 'uniform'
  softness: number
  tension: number
  curve: BlurCurve
}

export const DEFAULT_PAGE_BLUR_TUNING: PageBlurTuning = {
  enabled: true,
  direction: 'top',
  layerCount: 8,
  maxBlurPx: 8,
  featherPx: 48,
  curve: 'exponential',
  tension: 1.15,
  radius: '0px',
  tintOpacityPercent: 6,
}

export const DEFAULT_HALO_TUNING: HaloTuning = {
  enabled: false,
  spread: 26,
  layerCount: 5,
  maxBlurPx: 14,
  bias: 'bottom',
  softness: 40,
  tension: 1,
  curve: 'exponential',
}

export const DEFAULT_DOCK_CHROME_TUNING: DockChromeTuning = {
  enabled: false,
  shadowOffsetY: 10,
  shadowBlur: 22,
  shadowSpread: -4,
  shadowOpacity: 0.34,
  surfaceMixPercent: 100,
  ringOpacityPercent: 20,
}

export const DEFAULT_POPUP_HALO_TUNING: PopupHaloTuning = {
  enabled: false,
  spread: 20,
  layerCount: 4,
  maxBlurPx: 12,
  bias: 'uniform',
  softness: 38,
  tension: 1,
  curve: 'exponential',
}

export type ElevationTuningValue = {
  pageBlur: PageBlurTuning
  setPageBlur: (p: Partial<PageBlurTuning>) => void
  halo: HaloTuning
  setHalo: (p: Partial<HaloTuning>) => void
  dockChrome: DockChromeTuning
  setDockChrome: (p: Partial<DockChromeTuning>) => void
  popupHalo: PopupHaloTuning
  setPopupHalo: (p: Partial<PopupHaloTuning>) => void
  resetAll: () => void
}

function usePatchState<T>(initial: T): [T, (patch: Partial<T>) => void] {
  const [state, setState] = useState<T>(initial)
  const patch = useCallback((p: Partial<T>) => setState((s) => ({...s, ...p})), [])
  return [state, patch]
}

const ElevationTuningContext = createContext<ElevationTuningValue | null>(null)
ElevationTuningContext.displayName = 'ElevationTuningContext'

export function ControlCenterElevationProvider({children}: {children: ReactNode}) {
  const [pageBlur, setPageBlur] = usePatchState(DEFAULT_PAGE_BLUR_TUNING)
  const [halo, setHalo] = usePatchState(DEFAULT_HALO_TUNING)
  const [dockChrome, setDockChrome] = usePatchState(DEFAULT_DOCK_CHROME_TUNING)
  const [popupHalo, setPopupHalo] = usePatchState(DEFAULT_POPUP_HALO_TUNING)

  const resetAll = useCallback(() => {
    setPageBlur(DEFAULT_PAGE_BLUR_TUNING)
    setHalo(DEFAULT_HALO_TUNING)
    setDockChrome(DEFAULT_DOCK_CHROME_TUNING)
    setPopupHalo(DEFAULT_POPUP_HALO_TUNING)
  }, [setPageBlur, setHalo, setDockChrome, setPopupHalo])

  const value = useMemo<ElevationTuningValue>(
    () => ({pageBlur, setPageBlur, halo, setHalo, dockChrome, setDockChrome, popupHalo, setPopupHalo, resetAll}),
    [pageBlur, setPageBlur, halo, setHalo, dockChrome, setDockChrome, popupHalo, setPopupHalo, resetAll],
  )

  return <ElevationTuningContext.Provider value={value}>{children}</ElevationTuningContext.Provider>
}

export function useDockElevationTuning(): ElevationTuningValue {
  const v = useContext(ElevationTuningContext)
  if (!v) throw new Error('useDockElevationTuning must be used within ControlCenterElevationProvider')
  return v
}

export function isDockHaloEnabled(h: HaloTuning): boolean {
  return h.enabled
}

/** @deprecated Use {@link isDockHaloEnabled} */
export const isDockHaloBarEnabled = isDockHaloEnabled

export function isDockChromeTuningEnabled(c: DockChromeTuning): boolean {
  return c.enabled
}

export function isPopupHaloEnabled(p: PopupHaloTuning): boolean {
  return p.enabled
}
