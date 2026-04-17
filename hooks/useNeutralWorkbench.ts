'use client'

/**
 * Workbench state: `global` is memoized from `globalConfig` only.
 * Contrast / preview toggles update `lightTokens` / `darkTokens` but must not rebuild the global
 * ramp — UI sections that only depend on `global` + `globalConfig` are wrapped in `React.memo`
 * (see Workbench) so compact/wide and theme preview stay cheap to paint.
 *
 * Heavy work (`buildGlobalScale`, `deriveSystemTokens`) runs off the urgent path via
 * `useDeferredValue` so typing in controls stays responsive while the palette catches up.
 */
import type {SetStateAction} from 'react'
import {useCallback, useDeferredValue, useMemo, useState, useTransition} from 'react'

import {
  buildGlobalScale,
  deriveSystemTokens,
  type GlobalScaleConfig,
  type GlobalSwatch,
  type SystemMappingConfig,
  type SystemToken,
  type WorkbenchSelection,
} from '@/lib/neutral-engine'
import {globalConfigsEqual, systemConfigsEqual} from '@/lib/neutral-engine/configEquality'

const DEFAULT_GLOBAL: GlobalScaleConfig = {
  steps: 48,
  lHigh: 0.985,
  lLow: 0.04,
  progression: 'linear',
  chromaMode: 'achromatic',
  baseChroma: 0.012,
  hue: 260,
  namingStyle: 'semantic',
  variantId: 'pure',
}

const DEFAULT_SYSTEM: SystemMappingConfig = {
  fillStart: 0,
  strokeStart: 2,
  textStart: 14,
  fillCount: 4,
  strokeCount: 3,
  textCount: 3,
  altCount: 2,
  stepInterval: 1,
  contrastDistance: 1,
  themeMode: 'light',
  darkSegmentLength: 8,
  altAlpha: 0.45,
  includeContrastGroups: false,
}

export function useNeutralWorkbench() {
  const [globalConfig, setGlobalConfigBase] = useState<GlobalScaleConfig>(DEFAULT_GLOBAL)
  const [systemConfig, setSystemConfigBase] = useState<SystemMappingConfig>(DEFAULT_SYSTEM)
  const [previewTheme, setPreviewThemeBase] = useState<'light' | 'dark'>('light')
  const [contrastMode, setContrastModeBase] = useState<'compact' | 'wide'>('compact')
  const [selection, setSelection] = useState<WorkbenchSelection | null>(null)

  const [isPending, startTransition] = useTransition()

  const setGlobalConfig = useCallback((action: SetStateAction<GlobalScaleConfig>) => {
    startTransition(() => setGlobalConfigBase(action))
  }, [])

  const setSystemConfig = useCallback((action: SetStateAction<SystemMappingConfig>) => {
    startTransition(() => setSystemConfigBase(action))
  }, [])

  const setPreviewTheme = useCallback((action: SetStateAction<'light' | 'dark'>) => {
    startTransition(() => setPreviewThemeBase(action))
  }, [])

  const setContrastMode = useCallback((action: SetStateAction<'compact' | 'wide'>) => {
    startTransition(() => setContrastModeBase(action))
  }, [])

  const deferredGlobalConfig = useDeferredValue(globalConfig)
  const deferredSystemConfig = useDeferredValue(systemConfig)

  const deferredStale = useMemo(
    () =>
      !globalConfigsEqual(globalConfig, deferredGlobalConfig) ||
      !systemConfigsEqual(systemConfig, deferredSystemConfig),
    [globalConfig, deferredGlobalConfig, systemConfig, deferredSystemConfig],
  )

  /** True while React is applying a transition or deferred values have not caught up to latest input. */
  const inputBusy = isPending || deferredStale

  const global = useMemo(() => buildGlobalScale(deferredGlobalConfig), [deferredGlobalConfig])

  const effectiveSystem = useMemo(
    () => ({
      ...deferredSystemConfig,
      contrastDistance:
        contrastMode === 'wide'
          ? Math.max(deferredSystemConfig.contrastDistance * 2.1, 2)
          : deferredSystemConfig.contrastDistance,
    }),
    [deferredSystemConfig, contrastMode],
  )

  const lightTokens = useMemo(
    () => deriveSystemTokens(global, {...effectiveSystem, themeMode: 'light'}),
    [global, effectiveSystem],
  )

  const darkTokens = useMemo(
    () => deriveSystemTokens(global, {...effectiveSystem, themeMode: 'darkElevated'}),
    [global, effectiveSystem],
  )

  const activeSystemTokens = previewTheme === 'light' ? lightTokens : darkTokens

  const selectGlobal = useCallback((index: number) => {
    setSelection({kind: 'global', index})
  }, [])

  const selectSystem = useCallback((id: string) => {
    setSelection({kind: 'system', id})
  }, [])

  return {
    globalConfig,
    setGlobalConfig,
    systemConfig,
    setSystemConfig,
    global,
    lightTokens,
    darkTokens,
    activeSystemTokens,
    previewTheme,
    setPreviewTheme,
    contrastMode,
    setContrastMode,
    selection,
    setSelection,
    selectGlobal,
    selectSystem,
    inputBusy,
  }
}

export type NeutralWorkbench = ReturnType<typeof useNeutralWorkbench>
export {DEFAULT_GLOBAL, DEFAULT_SYSTEM}
export type {GlobalSwatch, SystemToken}
