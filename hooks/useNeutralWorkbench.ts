'use client'

/**
 * Workbench state: all input changes are applied **synchronously** so the single token
 * derivation + CSS write lands within one React commit.
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
  applyOkhslEdit,
  buildArchitectureRamps,
  buildTokenView,
  clampSystemMappingToLadderLength,
  DEFAULT_ALPHA_NEUTRAL_CONFIG,
  DEFAULT_SYSTEM_MAPPING,
  deriveAlphaBaseIndices,
  deriveBrandSurfaceToken,
  deriveSystemTokens,
  okhslViewFromConfig,
  rampForTheme,
  type AlphaNeutralConfig,
  type ArchitectureRamps,
  type ContrastEmphasis,
  type GlobalScaleConfig,
  type GlobalSwatch,
  type NeutralArchitectureMode,
  type OkhslEdit,
  type OkhslView,
  type SystemMappingConfig,
  type SystemToken,
  type ThemeMode,
  type TokenView,
  type WorkbenchSelection,
} from '@/lib/neutral-engine'
import {
  DEFAULT_ADVANCED_DARK_SCALE,
  DEFAULT_ADVANCED_LIGHT_SCALE,
  DEFAULT_GLOBAL_SCALE_CONFIG,
} from '@/lib/neutral-engine/defaultGlobalScaleConfig'
import {clampGlobalScaleSteps} from '@/lib/neutral-engine/globalScale'
import {trimCssColorValue} from '@/lib/neutral-engine/serialize'
import {labelForGlobalPatchKey, labelForSystemPatchKey} from '@/lib/neutral-engine/workbenchInputLabels'

const DEFAULT_GLOBAL: GlobalScaleConfig = DEFAULT_GLOBAL_SCALE_CONFIG

const DEFAULT_SYSTEM: SystemMappingConfig = DEFAULT_SYSTEM_MAPPING

export function useNeutralWorkbench() {
  const [neutralArchitecture, setNeutralArchitectureBase] = useState<NeutralArchitectureMode>('advanced')
  const [globalScale, setGlobalScaleBase] = useState<GlobalScaleConfig>(DEFAULT_GLOBAL)
  const [lightScale, setLightScaleBase] = useState<GlobalScaleConfig>(DEFAULT_ADVANCED_LIGHT_SCALE)
  const [darkScale, setDarkScaleBase] = useState<GlobalScaleConfig>(DEFAULT_ADVANCED_DARK_SCALE)
  const [systemConfigBase, setSystemConfigBase] = useState<SystemMappingConfig>(DEFAULT_SYSTEM)
  const [previewTheme, setPreviewThemeBase] = useState<'light' | 'dark'>('light')
  const [contrastEmphasis, setContrastEmphasisBase] = useState<ContrastEmphasis>('default')
  const [selection, setSelection] = useState<WorkbenchSelection | null>(null)
  const [comparisonLayout, setComparisonLayout] = useState<ComparisonLayout>('split')
  const [showContrastPairs, setShowContrastPairs] = useState(false)
  const [inspectionMode, setInspectionMode] = useState(false)
  const [busyInputLabel, setBusyInputLabel] = useState('Updating')
  const [okhslEnabled, setOkhslEnabled] = useState(false)
  /** Which sibling scale variants / OKHSL edit in Advanced Mode. Simple Mode always `'global'`. */
  const [scaleEditTarget, setScaleEditTarget] = useState<'global' | 'light' | 'dark'>('light')
  const [alphaConfig, setAlphaConfig] = useState<AlphaNeutralConfig>(DEFAULT_ALPHA_NEUTRAL_CONFIG)

  const touchBusyLabel = useCallback((label: string) => {
    setBusyInputLabel(label)
  }, [])

  const bumpPresetTimer = useCallback((label: string) => {
    if (presetDebugEnabled()) {
      beginTimer(label)
      const last = getLastPreset()
      if (last) {
        setLastPreset({...last, setGlobalConfigLabel: label, setGlobalConfigAt: performance.now()})
      }
    }
  }, [])

  const setNeutralArchitecture = useCallback(
    (next: NeutralArchitectureMode, label = 'Neutral architecture') => {
      touchBusyLabel(label)
      setNeutralArchitectureBase(next)
      if (next === 'simple') {
        setScaleEditTarget('global')
      } else {
        setScaleEditTarget((t) => (t === 'global' ? 'light' : t))
      }
    },
    [touchBusyLabel],
  )

  const setGlobalScaleCfg = useCallback(
    (action: SetStateAction<GlobalScaleConfig>, label = 'Global scale') => {
      bumpPresetTimer(label)
      touchBusyLabel(label)
      setGlobalScaleBase(action)
    },
    [bumpPresetTimer, touchBusyLabel],
  )

  const setLightScaleCfg = useCallback(
    (action: SetStateAction<GlobalScaleConfig>, label = 'Light scale') => {
      bumpPresetTimer(label)
      touchBusyLabel(label)
      setLightScaleBase(action)
    },
    [bumpPresetTimer, touchBusyLabel],
  )

  const setDarkScaleCfg = useCallback(
    (action: SetStateAction<GlobalScaleConfig>, label = 'Dark scale') => {
      bumpPresetTimer(label)
      touchBusyLabel(label)
      setDarkScaleBase(action)
    },
    [bumpPresetTimer, touchBusyLabel],
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

  /** Simple Mode — edits legacy unified ramp only. */
  const patchGlobal = useCallback(
    <K extends keyof GlobalScaleConfig>(key: K, value: GlobalScaleConfig[K], explicitLabel?: string) => {
      touchBusyLabel(explicitLabel ?? labelForGlobalPatchKey(key))
      setGlobalScaleBase((prev) => (prev[key] === value ? prev : {...prev, [key]: value}))
    },
    [touchBusyLabel],
  )

  /** Advanced Mode — light sibling ramp */
  const patchLight = useCallback(
    <K extends keyof GlobalScaleConfig>(key: K, value: GlobalScaleConfig[K], explicitLabel?: string) => {
      touchBusyLabel(explicitLabel ?? labelForGlobalPatchKey(key))
      setLightScaleBase((prev) => (prev[key] === value ? prev : {...prev, [key]: value}))
    },
    [touchBusyLabel],
  )

  /** Advanced Mode — dark sibling ramp */
  const patchDark = useCallback(
    <K extends keyof GlobalScaleConfig>(key: K, value: GlobalScaleConfig[K], explicitLabel?: string) => {
      touchBusyLabel(explicitLabel ?? labelForGlobalPatchKey(key))
      setDarkScaleBase((prev) => (prev[key] === value ? prev : {...prev, [key]: value}))
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

  const inputBusy = false

  const ladderGlobalN = useMemo(() => clampGlobalScaleSteps(globalScale.steps), [globalScale.steps])
  const ladderLightN = useMemo(() => clampGlobalScaleSteps(lightScale.steps), [lightScale.steps])
  const ladderDarkN = useMemo(() => clampGlobalScaleSteps(darkScale.steps), [darkScale.steps])

  const ladderFormN = useMemo(
    () =>
      neutralArchitecture === 'advanced'
        ? Math.max(2, ladderLightN, ladderDarkN)
        : ladderGlobalN,
    [neutralArchitecture, ladderGlobalN, ladderLightN, ladderDarkN],
  )

  /** UI + shared clamp — widest ladder bounds both themes when Advanced. */
  const systemConfig = useMemo(
    () => clampSystemMappingToLadderLength(ladderFormN, systemConfigBase),
    [ladderFormN, systemConfigBase],
  )

  const architectureRamps: ArchitectureRamps = useMemo(
    () =>
      buildArchitectureRamps({
        architecture: neutralArchitecture,
        globalScale,
        lightScale,
        darkScale,
      }),
    [neutralArchitecture, globalScale, lightScale, darkScale],
  )

  const effectiveMappingLight = useMemo(
    () =>
      applyContrastEmphasisToSystemMapping(
        clampSystemMappingToLadderLength(ladderLightN, systemConfigBase),
        contrastEmphasis,
      ),
    [systemConfigBase, contrastEmphasis, ladderLightN],
  )

  const effectiveMappingDark = useMemo(
    () =>
      applyContrastEmphasisToSystemMapping(
        clampSystemMappingToLadderLength(ladderDarkN, systemConfigBase),
        contrastEmphasis,
      ),
    [systemConfigBase, contrastEmphasis, ladderDarkN],
  )

  /** @deprecated Prefer {@link effectiveMappingLight} — kept for callers that assumed one ladder length. */
  const effectiveMappingConfig = effectiveMappingLight
  const immediateMappingConfig = effectiveMappingLight

  const lightRamp = useMemo(() => rampForTheme(architectureRamps, 'light'), [architectureRamps])
  const darkRamp = useMemo(() => rampForTheme(architectureRamps, 'darkElevated'), [architectureRamps])

  /** Legacy single `global` ramp — mirrors light ramp when Advanced (preview + inspector heuristic). */
  const global = lightRamp

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!presetDebugEnabled()) return
    const last = getLastPreset()
    if (!last) return
    const perfLabel = last.kind === 'variant' ? 'PresetPerf' : 'ScalePerf'
    console.log(
      perfLabel,
      'buildArchitectureRamps',
      JSON.stringify({label: last.label, lightSteps: lightRamp.length, darkSteps: darkRamp.length, at: performance.now()}),
    )
  }, [lightRamp, darkRamp])

  const liveBrandSurfaceOklch = useMemo(() => {
    const light = deriveBrandSurfaceToken(lightRamp, effectiveMappingLight, 'light')
    const dark = deriveBrandSurfaceToken(darkRamp, effectiveMappingDark, 'darkElevated')
    return {
      light: trimCssColorValue(light?.serialized.oklchCss ?? 'oklch(0% 0 none)'),
      dark: trimCssColorValue(dark?.serialized.oklchCss ?? 'oklch(0% 0 none)'),
    }
  }, [lightRamp, darkRamp, effectiveMappingLight, effectiveMappingDark])

  const lightTokens = useMemo(
    () => deriveSystemTokens(lightRamp, {...effectiveMappingLight, themeMode: 'light'}),
    [lightRamp, effectiveMappingLight],
  )

  const darkTokens = useMemo(
    () => deriveSystemTokens(darkRamp, {...effectiveMappingDark, themeMode: 'darkElevated'}),
    [darkRamp, effectiveMappingDark],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!presetDebugEnabled()) return
    const last = getLastPreset()
    if (!last) return

    endTimerOnce()

    try {
      const entry = getPresetCounts(last.at)
      if (entry) {
        console.log(
          last.kind === 'variant' ? 'PresetPerf' : 'ScalePerf',
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
      last.kind === 'variant' ? 'PresetPerf' : 'ScalePerf',
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

  const okhslEditableConfig =
    neutralArchitecture === 'simple'
      ? globalScale
      : scaleEditTarget === 'light'
        ? lightScale
        : scaleEditTarget === 'dark'
          ? darkScale
          : globalScale

  const okhslView: OkhslView = useMemo(
    () => okhslViewFromConfig(okhslEditableConfig),
    [okhslEditableConfig],
  )

  const commitOkhslToTarget = useCallback(
    (cfg: GlobalScaleConfig) => {
      if (neutralArchitecture === 'simple') {
        setGlobalScaleBase(cfg)
        return
      }
      if (scaleEditTarget === 'light') setLightScaleBase(cfg)
      else if (scaleEditTarget === 'dark') setDarkScaleBase(cfg)
      else setGlobalScaleBase(cfg)
    },
    [neutralArchitecture, scaleEditTarget],
  )

  const setGlobalConfigFromOkhsl = useCallback(
    (edit: OkhslEdit, label = 'OKHSL') => {
      if (presetDebugEnabled()) beginTimer(label)
      touchBusyLabel(label)
      commitOkhslToTarget(applyOkhslEdit(okhslEditableConfig, edit))
    },
    [touchBusyLabel, commitOkhslToTarget, okhslEditableConfig],
  )

  /** Preset loader & Variants Section — resolves to the active Edit target’s scale setter. */
  const setScaleConfigPreset = useCallback(
    (action: SetStateAction<GlobalScaleConfig>, label?: string) => {
      if (neutralArchitecture === 'simple') {
        setGlobalScaleCfg(action, label)
        return
      }
      if (scaleEditTarget === 'light') {
        setLightScaleCfg(action, label)
      } else if (scaleEditTarget === 'dark') {
        setDarkScaleCfg(action, label)
      } else {
        setGlobalScaleCfg(action, label)
      }
    },
    [neutralArchitecture, scaleEditTarget, setGlobalScaleCfg, setLightScaleCfg, setDarkScaleCfg],
  )

  const lightTokenView = useMemo(() => buildTokenView(lightTokens), [lightTokens])
  const darkTokenView = useMemo(() => buildTokenView(darkTokens), [darkTokens])

  const alphaBaseIndices = useMemo(
    () => deriveAlphaBaseIndices(architectureRamps, lightTokens, darkTokens, alphaConfig),
    [architectureRamps, lightTokens, darkTokens, alphaConfig],
  )

  const inspectionGlobalRamp = previewTheme === 'light' ? lightRamp : darkRamp

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

  return useMemo(
    () => ({
      neutralArchitecture,
      setNeutralArchitecture,
      globalScale,
      lightScale,
      darkScale,
      /** @deprecated Prefer `globalScale` — alias for presets that still pass `globalConfig`. */
      globalConfig: globalScale,
      setGlobalScale: setGlobalScaleCfg,
      setLightScale: setLightScaleCfg,
      setDarkScale: setDarkScaleCfg,
      patchGlobal,
      patchLight,
      patchDark,
      setScaleConfigPreset,
      ladderLightSteps: ladderLightN,
      ladderDarkSteps: ladderDarkN,
      ladderGlobalSteps: ladderGlobalN,
      systemConfig,
      setSystemConfig,
      patchSystem,
      effectiveMappingConfig,
      effectiveMappingLight,
      effectiveMappingDark,
      immediateMappingConfig,
      architectureRamps,
      lightRamp,
      darkRamp,
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
      okhslEnabled,
      setOkhslEnabled,
      scaleEditTarget,
      setScaleEditTarget,
      okhslView,
      okhslEditableConfig,
      setGlobalConfigFromOkhsl,
      alphaConfig,
      setAlphaConfig,
      alphaBaseIndices,
      inspectionGlobalRamp,
    }),
    [
      neutralArchitecture,
      setNeutralArchitecture,
      globalScale,
      lightScale,
      darkScale,
      setGlobalScaleCfg,
      setLightScaleCfg,
      setDarkScaleCfg,
      patchGlobal,
      patchLight,
      patchDark,
      setScaleConfigPreset,
      ladderLightN,
      ladderDarkN,
      ladderGlobalN,
      systemConfig,
      setSystemConfig,
      patchSystem,
      effectiveMappingConfig,
      effectiveMappingLight,
      effectiveMappingDark,
      immediateMappingConfig,
      architectureRamps,
      lightRamp,
      darkRamp,
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
      okhslEnabled,
      setOkhslEnabled,
      scaleEditTarget,
      setScaleEditTarget,
      okhslView,
      okhslEditableConfig,
      setGlobalConfigFromOkhsl,
      alphaConfig,
      setAlphaConfig,
      alphaBaseIndices,
      inspectionGlobalRamp,
    ],
  )
}

export type NeutralWorkbench = ReturnType<typeof useNeutralWorkbench>
export {
  DEFAULT_ADVANCED_DARK_SCALE as DEFAULT_ADVANCED_DARK,
  DEFAULT_ADVANCED_LIGHT_SCALE as DEFAULT_ADVANCED_LIGHT,
  DEFAULT_GLOBAL,
  DEFAULT_SYSTEM,
}
export type {GlobalSwatch, SystemToken}
