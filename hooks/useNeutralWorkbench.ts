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
  deriveBrandSurfaceToken,
  deriveSystemTokens,
  type ContrastEmphasis,
  type GlobalScaleConfig,
  type GlobalSwatch,
  type SystemMappingConfig,
  type SystemToken,
  type ThemeMode,
  type TokenView,
  type WorkbenchSelection,
} from '@/lib/neutral-engine'
import {clampGlobalScaleSteps} from '@/lib/neutral-engine/globalScale'
import {trimCssColorValue} from '@/lib/neutral-engine/serialize'
import {globalConfigsEqual, systemConfigsEqual} from '@/lib/neutral-engine/configEquality'
import {labelForGlobalPatchKey, labelForSystemPatchKey} from '@/lib/neutral-engine/workbenchInputLabels'

const DEFAULT_GLOBAL: GlobalScaleConfig = {
  steps: 41,
  lHigh: 0.985,
  lLow: 0.1615,
  progression: 'linear',
  chromaMode: 'achromatic',
  baseChroma: 0.012,
  hue: 260,
  namingStyle: 'token_ladder',
  variantId: 'pure',
}

const DEFAULT_SYSTEM: SystemMappingConfig = DEFAULT_SYSTEM_MAPPING

export function useNeutralWorkbench() {
  const [globalConfig, setGlobalConfigBase] = useState<GlobalScaleConfig>(DEFAULT_GLOBAL)
  const [systemConfigBase, setSystemConfigBase] = useState<SystemMappingConfig>(DEFAULT_SYSTEM)
  const [previewTheme, setPreviewThemeBase] = useState<'light' | 'dark'>('light')
  /**
   * Global theme mode — drives `<html data-theme>` and the entire workbench chrome via the --ns-* alias layer.
   * Distinct from `previewTheme`, which stays preview-only (Focus selector for semantic blocks).
   */
  const [themeMode, setThemeModeBase] = useState<'light' | 'dark'>('dark')
  const [contrastEmphasis, setContrastEmphasisBase] = useState<ContrastEmphasis>('default')
  const [selection, setSelection] = useState<WorkbenchSelection | null>(null)
  /**
   * Light vs Dark comparison panel: split shows both ramps; focus shows one (preview toolbar picks which).
   * We still derive light+dark tokens whenever mapping changes — export and theme panels need both themes;
   * skipping one `deriveSystemTokens` in focus mode would require lazy export or a second deferred pass.
   */
  const [comparisonLayout, setComparisonLayout] = useState<ComparisonLayout>('split')
  const [showContrastPairs, setShowContrastPairs] = useState(false)
  /** Inspection mode highlights semantic annotations and routes clicks to the Inspector. */
  const [inspectionMode, setInspectionMode] = useState(false)
  const [busyInputLabel, setBusyInputLabel] = useState('Updating')

  const [isPending, startTransition] = useTransition()

  const touchBusyLabel = useCallback((label: string) => {
    setBusyInputLabel(label)
  }, [])

  const setGlobalConfig = useCallback(
    (action: SetStateAction<GlobalScaleConfig>, label = 'Global scale') => {
      touchBusyLabel(label)
      startTransition(() => setGlobalConfigBase(action))
    },
    [touchBusyLabel],
  )

  const setSystemConfig = useCallback(
    (action: SetStateAction<SystemMappingConfig>, label = 'System mapping') => {
      touchBusyLabel(label)
      startTransition(() => setSystemConfigBase(action))
    },
    [touchBusyLabel],
  )

  const setPreviewTheme = useCallback(
    (value: 'light' | 'dark', label = 'Preview theme') => {
      touchBusyLabel(label)
      startTransition(() => setPreviewThemeBase(value))
    },
    [touchBusyLabel],
  )

  /** Global theme toggle — non-deferred so the whole chrome flips immediately. */
  const setThemeMode = useCallback(
    (value: 'light' | 'dark', label = 'Theme mode') => {
      touchBusyLabel(label)
      setThemeModeBase(value)
    },
    [touchBusyLabel],
  )

  const toggleThemeMode = useCallback(() => {
    setThemeModeBase((v) => (v === 'light' ? 'dark' : 'light'))
  }, [])

  const emphasisLabel = useCallback((e: ContrastEmphasis): string => {
    const m: Record<ContrastEmphasis, string> = {
      subtle: 'Contrast · Subtle',
      default: 'Contrast · Default',
      strong: 'Contrast · Strong',
      inverse: 'Contrast · Inverse',
    }
    return m[e]
  }, [])

  const setContrastEmphasis = useCallback(
    (value: ContrastEmphasis, label?: string) => {
      touchBusyLabel(label ?? emphasisLabel(value))
      startTransition(() => setContrastEmphasisBase(value))
    },
    [touchBusyLabel, emphasisLabel],
  )

  /** Single-field updates with referential stability when the value is unchanged (avoids redundant transitions). */
  const patchGlobal = useCallback(
    <K extends keyof GlobalScaleConfig>(key: K, value: GlobalScaleConfig[K], explicitLabel?: string) => {
      touchBusyLabel(explicitLabel ?? labelForGlobalPatchKey(key))
      startTransition(() => {
        setGlobalConfigBase((prev) => (prev[key] === value ? prev : {...prev, [key]: value}))
      })
    },
    [touchBusyLabel],
  )

  const patchSystem = useCallback(
    <K extends keyof SystemMappingConfig>(key: K, value: SystemMappingConfig[K], explicitLabel?: string) => {
      touchBusyLabel(explicitLabel ?? labelForSystemPatchKey(key))
      startTransition(() => {
        setSystemConfigBase((prev) => (prev[key] === value ? prev : {...prev, [key]: value}))
      })
    },
    [touchBusyLabel],
  )

  const deferredSystemBase = useDeferredValue(systemConfigBase)
  const deferredGlobalConfig = useDeferredValue(globalConfig)
  const deferredContrastEmphasis = useDeferredValue(contrastEmphasis)
  const deferredPreviewTheme = useDeferredValue(previewTheme)

  const systemDeferredStale = useMemo(
    () => !systemConfigsEqual(systemConfigBase, deferredSystemBase),
    [systemConfigBase, deferredSystemBase],
  )

  const globalDeferredStale = useMemo(
    () => !globalConfigsEqual(globalConfig, deferredGlobalConfig),
    [globalConfig, deferredGlobalConfig],
  )

  const contrastDeferredStale = contrastEmphasis !== deferredContrastEmphasis
  const themeDeferredStale = previewTheme !== deferredPreviewTheme

  /**
   * True while a transition is pending **or** any deferred mirror of controlled inputs has not
   * caught up (global scale, system mapping, contrast, preview theme). Keeps loading UI visible
   * for the full deferred window — `isPending` alone often clears in one frame.
   */
  const inputBusy =
    isPending ||
    globalDeferredStale ||
    systemDeferredStale ||
    contrastDeferredStale ||
    themeDeferredStale

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

  /** Same mapping rules as token derivation, but **not** deferred — used for live `surface.brand` OKLCH in semantic preview. */
  const immediateMappingConfig = useMemo(
    () =>
      applyContrastEmphasisToSystemMapping(
        clampSystemMappingToLadderLength(ladderN, systemConfigBase),
        contrastEmphasis,
      ),
    [systemConfigBase, contrastEmphasis, ladderN],
  )

  const liveBrandSurfaceOklch = useMemo(() => {
    const light = deriveBrandSurfaceToken(global, immediateMappingConfig, 'light')
    const dark = deriveBrandSurfaceToken(global, immediateMappingConfig, 'darkElevated')
    return {
      light: trimCssColorValue(light?.serialized.oklchCss ?? 'oklch(0% 0 none)'),
      dark: trimCssColorValue(dark?.serialized.oklchCss ?? 'oklch(0% 0 none)'),
    }
  }, [global, immediateMappingConfig])

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

  const selectSystem = useCallback((id: string, theme?: ThemeMode) => {
    setSelection({kind: 'system', id, theme})
  }, [])

  const toggleInspectionMode = useCallback(() => {
    setInspectionMode((v) => !v)
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
    /** Non-deferred mapping; `liveBrandSurfaceOklch` tracks Custom Brand without `useDeferredValue` lag. */
    immediateMappingConfig,
    liveBrandSurfaceOklch,
    global,
    lightTokens,
    darkTokens,
    lightTokenView,
    darkTokenView,
    activeTokenView,
    activeSystemTokens,
    previewTheme,
    setPreviewTheme,
    themeMode,
    setThemeMode,
    toggleThemeMode,
    contrastEmphasis,
    setContrastEmphasis,
    selection,
    setSelection,
    selectGlobal,
    selectSystem,
    inputBusy,
    busyInputLabel,
    comparisonLayout,
    setComparisonLayout,
    showContrastPairs,
    setShowContrastPairs,
    inspectionMode,
    setInspectionMode,
    toggleInspectionMode,
  }
}

export type NeutralWorkbench = ReturnType<typeof useNeutralWorkbench>
export {DEFAULT_GLOBAL, DEFAULT_SYSTEM}
export type {GlobalSwatch, SystemToken}
