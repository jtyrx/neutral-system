'use client'

import {createContext, useContext} from 'react'

import type {RampPreviewMode} from '@/lib/workbench/dockPickerStorage'

export type EffectiveRampContext = 'light' | 'dark' | 'both'

export type ControlCenterPanelContextValue = {
  rampPreviewMode: RampPreviewMode
  effectiveRampContext: EffectiveRampContext
}

export const ControlCenterPanelContext =
  createContext<ControlCenterPanelContextValue | null>(null)

ControlCenterPanelContext.displayName = 'ControlCenterPanelContext'

export function useControlCenterPanelContext(): ControlCenterPanelContextValue {
  const ctx = useContext(ControlCenterPanelContext)
  if (!ctx) throw new Error('useControlCenterPanelContext: missing provider')
  return ctx
}

const FIXED_RAMP_CONTEXT_BY_MODE: Partial<
  Record<RampPreviewMode, EffectiveRampContext>
> = {
  both: 'both',
  light: 'light',
  dark: 'dark',
}

export function deriveRampContext(
  mode: RampPreviewMode,
  previewTheme: 'light' | 'dark',
): EffectiveRampContext {
  return FIXED_RAMP_CONTEXT_BY_MODE[mode] ?? previewTheme
}
