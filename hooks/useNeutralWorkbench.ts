'use client'

/**
 * Workbench state: `global` is memoized from the **current** `globalConfig` (not deferred) so
 * ladder length, resolved indices, and `deriveSystemTokens` stay aligned when Steps changes.
 * System mapping uses `useDeferredValue` so dense control panels stay responsive while tokens catch up.
 */
import type {SetStateAction} from 'react'
import {useCallback, useDeferredValue, useMemo, useState, useTransition} from 'react'

import type {ComparisonLayout} from '@/components/preview/PreviewComparison'
import {
  applyContrastEmphasisToSystemMapping,
  buildGlobalScale,
  buildTokenView,
  clampSystemMappingToLadderLength,
  DEFAULT_SYSTEM_MAPPING,
  deriveSystemTokens,
  type ContrastEmphasis,
  type GlobalScaleConfig,
  type GlobalSwatch,
  type SystemMappingConfig,
  type SystemToken,
  type TokenView,
  type WorkbenchSelection,
} from '@/lib/neutral-engine'
import {clampGlobalScaleSteps} from '@/lib/neutral-engine/globalScale'
import {systemConfigsEqual} from '@/lib/neutral-engine/configEquality'

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

const DEFAULT_SYSTEM: SystemMappingConfig = DEFAULT_SYSTEM_MAPPING

export function useNeutralWorkbench() {
  const [globalConfig, setGlobalConfigBase] = useState<GlobalScaleConfig>(DEFAULT_GLOBAL)
  const [systemConfigBase, setSystemConfigBase] = useState<SystemMappingConfig>(DEFAULT_SYSTEM)
  const [previewTheme, setPreviewThemeBase] = useState<'light' | 'dark'>('light')
  const [contrastEmphasis, setContrastEmphasisBase] = useState<ContrastEmphasis>('inverse')
  const [selection, setSelection] = useState<WorkbenchSelection | null>(null)
  /**
   * Light vs Dark comparison panel: split shows both ramps; focus shows one (preview toolbar picks which).
   * We still derive light+dark tokens whenever mapping changes — export and theme panels need both themes;
   * skipping one `deriveSystemTokens` in focus mode would require lazy export or a second deferred pass.
   */
  const [comparisonLayout, setComparisonLayout] = useState<ComparisonLayout>('split')
  const [showContrastPairs, setShowContrastPairs] = useState(false)

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

  const setContrastEmphasis = useCallback((action: SetStateAction<ContrastEmphasis>) => {
    startTransition(() => setContrastEmphasisBase(action))
  }, [])

  /** Single-field updates with referential stability when the value is unchanged (avoids redundant transitions). */
  const patchGlobal = useCallback(<K extends keyof GlobalScaleConfig>(key: K, value: GlobalScaleConfig[K]) => {
    startTransition(() => {
      setGlobalConfigBase((prev) => (prev[key] === value ? prev : {...prev, [key]: value}))
    })
  }, [])

  const patchSystem = useCallback(<K extends keyof SystemMappingConfig>(key: K, value: SystemMappingConfig[K]) => {
    startTransition(() => {
      setSystemConfigBase((prev) => (prev[key] === value ? prev : {...prev, [key]: value}))
    })
  }, [])

  const deferredSystemBase = useDeferredValue(systemConfigBase)

  const deferredStale = useMemo(
    () => !systemConfigsEqual(systemConfigBase, deferredSystemBase),
    [systemConfigBase, deferredSystemBase],
  )

  /** True while React is applying a transition or deferred values have not caught up to latest input. */
  const inputBusy = isPending || deferredStale

  const ladderN = useMemo(() => clampGlobalScaleSteps(globalConfig.steps), [globalConfig.steps])

  /** Ladder-bounded mapping — matches `deriveSystemTokens` / export (starts & dark segment stay in range). */
  const systemConfig = useMemo(
    () => clampSystemMappingToLadderLength(ladderN, systemConfigBase),
    [ladderN, systemConfigBase],
  )

  const global = useMemo(() => buildGlobalScale(globalConfig), [globalConfig])

  /** Same object passed to deriveSystemTokens — also drives resolved-index UI (must stay aligned). */
  const effectiveMappingConfig = useMemo(
    () =>
      applyContrastEmphasisToSystemMapping(
        clampSystemMappingToLadderLength(ladderN, deferredSystemBase),
        contrastEmphasis,
      ),
    [deferredSystemBase, contrastEmphasis, ladderN],
  )

  const lightTokens = useMemo(
    () => deriveSystemTokens(global, {...effectiveMappingConfig, themeMode: 'light'}),
    [global, effectiveMappingConfig],
  )

  const darkTokens = useMemo(
    () => deriveSystemTokens(global, {...effectiveMappingConfig, themeMode: 'darkElevated'}),
    [global, effectiveMappingConfig],
  )

  const lightTokenView = useMemo(() => buildTokenView(lightTokens), [lightTokens])
  const darkTokenView = useMemo(() => buildTokenView(darkTokens), [darkTokens])

  const activeSystemTokens = previewTheme === 'light' ? lightTokens : darkTokens
  const activeTokenView = useMemo(
    (): TokenView => (previewTheme === 'light' ? lightTokenView : darkTokenView),
    [previewTheme, lightTokenView, darkTokenView],
  )

  const selectGlobal = useCallback((index: number) => {
    setSelection({kind: 'global', index})
  }, [])

  const selectSystem = useCallback((id: string) => {
    setSelection({kind: 'system', id})
  }, [])

  return {
    globalConfig,
    setGlobalConfig,
    patchGlobal,
    systemConfig,
    setSystemConfig,
    patchSystem,
    /** Deferred + contrast-mode-adjusted; use for any display that must match token derivation. */
    effectiveMappingConfig,
    global,
    lightTokens,
    darkTokens,
    lightTokenView,
    darkTokenView,
    activeTokenView,
    activeSystemTokens,
    previewTheme,
    setPreviewTheme,
    contrastEmphasis,
    setContrastEmphasis,
    selection,
    setSelection,
    selectGlobal,
    selectSystem,
    inputBusy,
    comparisonLayout,
    setComparisonLayout,
    showContrastPairs,
    setShowContrastPairs,
  }
}

export type NeutralWorkbench = ReturnType<typeof useNeutralWorkbench>
export {DEFAULT_GLOBAL, DEFAULT_SYSTEM}
export type {GlobalSwatch, SystemToken}
