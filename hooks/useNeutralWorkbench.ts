'use client'

/**
 * Workbench state: all input changes are applied **synchronously** so the single token
 * derivation + CSS write lands within one React commit. Our instrumented costs
 * (`buildGlobalScale` ≤3ms, `deriveSystemTokens` ≤1ms, `buildTokenView` ≤0.2ms,
 * `exportCssVariables` ≤0.2ms, CSS var recalc ≈15ms) total ~15-20ms per click — well
 * under a frame. `useTransition`/`useDeferredValue` were previously used to defer heavy
 * derivation, but that work is now cheap, and relying on the React concurrent scheduler
 * turns a one-frame update into many-frames — catastrophic when the browser throttles
 * rAF to 1Hz for unfocused windows. Synchronous updates stay fast in every focus state.
 */
import type {SetStateAction} from 'react'
import {useCallback, useEffect, useMemo, useState} from 'react'

import type {ComparisonLayout} from '@/components/preview/PreviewComparison'
import {
  beginTimer,
  endTimerOnce,
  getLastPreset,
  getPresetCounts,
  presetDebugEnabled,
  setLastPreset,
} from '@/lib/debug/presetDebug'
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

  const touchBusyLabel = useCallback((label: string) => {
    setBusyInputLabel(label)
  }, [])

  const setGlobalConfig = useCallback(
    (action: SetStateAction<GlobalScaleConfig>, label = 'Global scale') => {
      if (presetDebugEnabled()) {
        beginTimer(label)
        const last = getLastPreset()
        if (last) {
          setLastPreset({...last, setGlobalConfigLabel: label, setGlobalConfigAt: performance.now()})
        }
      }
      touchBusyLabel(label)
      setGlobalConfigBase(action)
    },
    [touchBusyLabel],
  )

  const setSystemConfig = useCallback(
    (action: SetStateAction<SystemMappingConfig>, label = 'System mapping') => {
      touchBusyLabel(label)
      setSystemConfigBase(action)
    },
    [touchBusyLabel],
  )

  const setPreviewTheme = useCallback(
    (value: 'light' | 'dark', label = 'Preview theme') => {
      touchBusyLabel(label)
      setPreviewThemeBase(value)
    },
    [touchBusyLabel],
  )

  /** Global theme toggle — synchronous so the whole chrome flips immediately. */
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
      setContrastEmphasisBase(value)
    },
    [touchBusyLabel, emphasisLabel],
  )

  /** Single-field updates with referential stability when the value is unchanged. */
  const patchGlobal = useCallback(
    <K extends keyof GlobalScaleConfig>(key: K, value: GlobalScaleConfig[K], explicitLabel?: string) => {
      touchBusyLabel(explicitLabel ?? labelForGlobalPatchKey(key))
      setGlobalConfigBase((prev) => (prev[key] === value ? prev : {...prev, [key]: value}))
    },
    [touchBusyLabel],
  )

  const patchSystem = useCallback(
    <K extends keyof SystemMappingConfig>(key: K, value: SystemMappingConfig[K], explicitLabel?: string) => {
      touchBusyLabel(explicitLabel ?? labelForSystemPatchKey(key))
      setSystemConfigBase((prev) => (prev[key] === value ? prev : {...prev, [key]: value}))
    },
    [touchBusyLabel],
  )

  /**
   * Always `false` — updates are synchronous and complete in a single commit, so there is
   * no "pending" window to report. Kept on the return surface for API stability with
   * consumers that still read it (e.g. `WorkbenchLoadingToast`).
   */
  const inputBusy = false

  const ladderN = useMemo(() => clampGlobalScaleSteps(globalConfig.steps), [globalConfig.steps])

  /** Ladder-bounded mapping — matches `deriveSystemTokens` / export (starts & dark segment stay in range). */
  const systemConfig = useMemo(
    () => clampSystemMappingToLadderLength(ladderN, systemConfigBase),
    [ladderN, systemConfigBase],
  )

  const global = useMemo(() => buildGlobalScale(globalConfig), [globalConfig])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!presetDebugEnabled()) return
    const last = getLastPreset()
    if (!last) return
    const perfLabel = last.kind === 'variant' ? 'PresetPerf' : 'ScalePerf'
    console.log(
      perfLabel,
      'buildGlobalScale',
      JSON.stringify({label: last.label, steps: global.length, at: performance.now()}),
    )
  }, [global])

  /**
   * Same object passed to deriveSystemTokens — also drives resolved-index UI (must stay aligned).
   * Synchronous: no deferred mirrors, token derivation runs in the same commit as the input change.
   */
  const effectiveMappingConfig = useMemo(
    () =>
      applyContrastEmphasisToSystemMapping(
        clampSystemMappingToLadderLength(ladderN, systemConfigBase),
        contrastEmphasis,
      ),
    [systemConfigBase, contrastEmphasis, ladderN],
  )

  /** Kept as a named alias for the live `surface.brand` OKLCH consumer; identical to effectiveMappingConfig. */
  const immediateMappingConfig = effectiveMappingConfig

  const liveBrandSurfaceOklch = useMemo(() => {
    const light = deriveBrandSurfaceToken(global, effectiveMappingConfig, 'light')
    const dark = deriveBrandSurfaceToken(global, effectiveMappingConfig, 'darkElevated')
    return {
      light: trimCssColorValue(light?.serialized.oklchCss ?? 'oklch(0% 0 none)'),
      dark: trimCssColorValue(dark?.serialized.oklchCss ?? 'oklch(0% 0 none)'),
    }
  }, [global, effectiveMappingConfig])

  const lightTokens = useMemo(
    () => deriveSystemTokens(global, {...effectiveMappingConfig, themeMode: 'light'}),
    [global, effectiveMappingConfig],
  )

  const darkTokens = useMemo(
    () => deriveSystemTokens(global, {...effectiveMappingConfig, themeMode: 'darkElevated'}),
    [global, effectiveMappingConfig],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!presetDebugEnabled()) return
    const last = getLastPreset()
    if (!last) return
    const perfLabel = last.kind === 'variant' ? 'PresetPerf' : 'ScalePerf'

    // End-to-end timer closes here (idempotent across re-renders via `timerEnded` guard).
    endTimerOnce()

    try {
      const entry = getPresetCounts(last.at)
      if (entry) {
        console.log(
          perfLabel,
          'Summary',
          JSON.stringify({
            kind: last.kind,
            label: last.label,
            buildGlobalScaleCalls: entry.buildGlobalScaleCalls ?? 0,
            at: performance.now(),
          }),
        )
      }
    } catch {
      // ignore
    }
    console.log(
      perfLabel,
      'deriveSystemTokens done',
      JSON.stringify({
        kind: last.kind,
        label: last.label,
        lightTokens: lightTokens.length,
        darkTokens: darkTokens.length,
        at: performance.now(),
      }),
    )
  }, [lightTokens, darkTokens])

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

  /**
   * Stabilize the returned bag: every setter is already `useCallback`-stable; only state values
   * rotate. Memoizing on the underlying states means any consumer that receives the full `wb`
   * object (e.g. `WorkbenchControlsShell`) can benefit from `React.memo` when the slices it reads
   * haven't changed. Without this, every workbench render would hand out a fresh object reference
   * and defeat downstream memoization.
   */
  return useMemo(
    () => ({
      globalConfig,
      setGlobalConfig,
      patchGlobal,
      systemConfig,
      setSystemConfig,
      patchSystem,
      effectiveMappingConfig,
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
    }),
    [
      globalConfig,
      setGlobalConfig,
      patchGlobal,
      systemConfig,
      setSystemConfig,
      patchSystem,
      effectiveMappingConfig,
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
      selectGlobal,
      selectSystem,
      inputBusy,
      busyInputLabel,
      comparisonLayout,
      showContrastPairs,
      inspectionMode,
      toggleInspectionMode,
    ],
  )
}

export type NeutralWorkbench = ReturnType<typeof useNeutralWorkbench>
export {DEFAULT_GLOBAL, DEFAULT_SYSTEM}
export type {GlobalSwatch, SystemToken}
