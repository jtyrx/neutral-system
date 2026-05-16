'use client'

/**
 * Workbench state: all input changes are applied **synchronously** so the single token
 * derivation + CSS write lands within one React commit.
 */
import type {Dispatch, SetStateAction} from 'react'
import {useCallback, useEffect, useLayoutEffect, useMemo, useState} from 'react'

import type {ComparisonLayout} from '@/components/preview/PreviewComparison'
import {
  beginTimer,
  endTimerOnce,
  getLastPreset,
  getPresetCounts,
  presetDebugEnabled,
  setLastPreset,
} from '@/lib/debug/presetDebug'
import {DEFAULT_ALPHA_NEUTRAL_CONFIG, deriveAlphaBaseIndices} from '@/lib/neutral-engine/alphaNeutralTokens'
import {buildArchitectureRamps, rampForTheme} from '@/lib/neutral-engine/architectureRamps'
import {DEFAULT_SYSTEM_MAPPING} from '@/lib/neutral-engine/defaultSystemMapping'
import {applyContrastEmphasisToSystemMapping} from '@/lib/neutral-engine/effectiveMapping'
import {applyOkhslEdit, okhslViewFromConfig} from '@/lib/neutral-engine/okhsl'
import {clampSystemMappingToLadderLength, deriveBrandSurfaceToken, deriveSystemTokens} from '@/lib/neutral-engine/systemMap'
import {buildTokenView} from '@/lib/neutral-engine/tokenViews'
import type {
  AlphaNeutralConfig,
  ArchitectureRamps,
  GlobalScaleConfig,
  GlobalSwatch,
  NeutralArchitectureMode,
  SystemMappingConfig,
  SystemToken,
  ThemeMode,
  WorkbenchSelection,
} from '@/lib/neutral-engine/types'
import type {ContrastEmphasis} from '@/lib/neutral-engine/semanticNaming'
import type {OkhslEdit, OkhslView} from '@/lib/neutral-engine/okhsl'
import type {TokenView} from '@/lib/neutral-engine/tokenViews'
import {
  DEFAULT_ADVANCED_DARK_SCALE,
  DEFAULT_ADVANCED_LIGHT_SCALE,
  DEFAULT_GLOBAL_SCALE_CONFIG,
} from '@/lib/neutral-engine/defaultGlobalScaleConfig'
import {clampGlobalScaleSteps} from '@/lib/neutral-engine/globalScale'
import {trimCssColorValue} from '@/lib/neutral-engine/serialize'
import {labelForGlobalPatchKey, labelForSystemPatchKey} from '@/lib/neutral-engine/workbenchInputLabels'
import {
  readWorkbenchFromStorage,
  writeWorkbenchToStorage,
  type WorkbenchPersistedPayloadV1,
} from '@/lib/workbench/workbenchStorage'

const DEFAULT_GLOBAL: GlobalScaleConfig = DEFAULT_GLOBAL_SCALE_CONFIG

const DEFAULT_SYSTEM: SystemMappingConfig = DEFAULT_SYSTEM_MAPPING

export interface NeutralWorkbench {
  neutralArchitecture: NeutralArchitectureMode
  setNeutralArchitecture: (next: NeutralArchitectureMode, label?: string) => void
  globalScale: GlobalScaleConfig
  lightScale: GlobalScaleConfig
  darkScale: GlobalScaleConfig
  /** @deprecated Prefer `globalScale` */
  globalConfig: GlobalScaleConfig
  setGlobalScale: (action: SetStateAction<GlobalScaleConfig>, label?: string) => void
  setLightScale: (action: SetStateAction<GlobalScaleConfig>, label?: string) => void
  setDarkScale: (action: SetStateAction<GlobalScaleConfig>, label?: string) => void
  patchGlobal: <K extends keyof GlobalScaleConfig>(key: K, value: GlobalScaleConfig[K], explicitLabel?: string) => void
  patchLight: <K extends keyof GlobalScaleConfig>(key: K, value: GlobalScaleConfig[K], explicitLabel?: string) => void
  patchDark: <K extends keyof GlobalScaleConfig>(key: K, value: GlobalScaleConfig[K], explicitLabel?: string) => void
  setScaleConfigPreset: (action: SetStateAction<GlobalScaleConfig>, label?: string) => void
  ladderLightSteps: number
  ladderDarkSteps: number
  ladderGlobalSteps: number
  systemConfig: SystemMappingConfig
  setSystemConfig: (action: SetStateAction<SystemMappingConfig>, label?: string) => void
  patchSystem: <K extends keyof SystemMappingConfig>(key: K, value: SystemMappingConfig[K], explicitLabel?: string) => void
  /** @deprecated Prefer `effectiveMappingLight` */
  effectiveMappingConfig: SystemMappingConfig
  effectiveMappingLight: SystemMappingConfig
  effectiveMappingDark: SystemMappingConfig
  immediateMappingConfig: SystemMappingConfig
  architectureRamps: ArchitectureRamps
  lightRamp: GlobalSwatch[]
  darkRamp: GlobalSwatch[]
  liveBrandSurfaceOklch: {light: string; dark: string}
  /** Legacy single ramp — mirrors lightRamp when Advanced */
  global: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  activeTokenView: TokenView
  activeSystemTokens: SystemToken[]
  previewTheme: 'light' | 'dark'
  setPreviewTheme: (value: 'light' | 'dark', label?: string) => void
  contrastEmphasis: ContrastEmphasis
  setContrastEmphasis: (value: ContrastEmphasis, label?: string) => void
  selection: WorkbenchSelection | null
  setSelection: Dispatch<SetStateAction<WorkbenchSelection | null>>
  selectGlobal: (index: number) => void
  selectSystem: (id: string, theme?: ThemeMode) => void
  inputBusy: false
  busyInputLabel: string
  comparisonLayout: ComparisonLayout
  setComparisonLayout: Dispatch<SetStateAction<ComparisonLayout>>
  showContrastPairs: boolean
  setShowContrastPairs: Dispatch<SetStateAction<boolean>>
  inspectionMode: boolean
  setInspectionMode: Dispatch<SetStateAction<boolean>>
  toggleInspectionMode: () => void
  okhslEnabled: boolean
  setOkhslEnabled: Dispatch<SetStateAction<boolean>>
  scaleEditTarget: 'global' | 'light' | 'dark'
  setScaleEditTarget: Dispatch<SetStateAction<'global' | 'light' | 'dark'>>
  okhslView: OkhslView
  okhslEditableConfig: GlobalScaleConfig
  setGlobalConfigFromOkhsl: (edit: OkhslEdit, label?: string) => void
  alphaConfig: AlphaNeutralConfig
  setAlphaConfig: Dispatch<SetStateAction<AlphaNeutralConfig>>
  alphaBaseIndices: {lightBase: number; darkBase: number}
  inspectionGlobalRamp: GlobalSwatch[]
}

export function useNeutralWorkbench(): NeutralWorkbench {
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
  const [storageReady, setStorageReady] = useState(false)
  const [okhslEnabled, setOkhslEnabled] = useState(false)
  /** Which sibling scale variants / OKHSL edit in Advanced Mode. Simple Mode always `'global'`. */
  const [scaleEditTarget, setScaleEditTarget] = useState<'global' | 'light' | 'dark'>('light')
  const [alphaConfig, setAlphaConfig] = useState<AlphaNeutralConfig>(DEFAULT_ALPHA_NEUTRAL_CONFIG)

  const touchBusyLabel = useCallback((label: string) => {
    setBusyInputLabel(label)
  }, [])

  /* One-time synchronous hydration from native `localStorage` before paint (`useLayoutEffect` + batch setStates). */
  /* eslint-disable react-hooks/set-state-in-effect -- client-only persisted workbench bootstrap */
  useLayoutEffect(() => {
    const p = readWorkbenchFromStorage()
    if (p) {
      setNeutralArchitectureBase(p.neutralArchitecture)
      setGlobalScaleBase(p.globalScale)
      setLightScaleBase(p.lightScale)
      setDarkScaleBase(p.darkScale)
      setSystemConfigBase(p.systemConfig)
      setContrastEmphasisBase(p.contrastEmphasis)
      setComparisonLayout(p.comparisonLayout)
      setShowContrastPairs(p.showContrastPairs)
      setInspectionMode(p.inspectionMode)
      setOkhslEnabled(p.okhslEnabled)
      setAlphaConfig(p.alphaConfig)
      setSelection(p.selection)
      if (p.neutralArchitecture === 'simple') {
        setScaleEditTarget('global')
      } else {
        setScaleEditTarget(p.scaleEditTarget)
      }
    }
    setStorageReady(true)
  }, [])
  /* eslint-enable react-hooks/set-state-in-effect */

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

  const persistPayload: WorkbenchPersistedPayloadV1 = useMemo(
    () => ({
      v: 1,
      neutralArchitecture,
      globalScale,
      lightScale,
      darkScale,
      systemConfig: systemConfigBase,
      contrastEmphasis,
      comparisonLayout,
      showContrastPairs,
      inspectionMode,
      okhslEnabled,
      scaleEditTarget,
      alphaConfig,
      selection,
    }),
    [
      neutralArchitecture,
      globalScale,
      lightScale,
      darkScale,
      systemConfigBase,
      contrastEmphasis,
      comparisonLayout,
      showContrastPairs,
      inspectionMode,
      okhslEnabled,
      scaleEditTarget,
      alphaConfig,
      selection,
    ],
  )

  useEffect(() => {
    if (!storageReady) return
    const handle = window.setTimeout(() => {
      writeWorkbenchToStorage(persistPayload)
    }, 220)
    return () => window.clearTimeout(handle)
  }, [storageReady, persistPayload])

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

export {
  DEFAULT_ADVANCED_DARK_SCALE as DEFAULT_ADVANCED_DARK,
  DEFAULT_ADVANCED_LIGHT_SCALE as DEFAULT_ADVANCED_LIGHT,
  DEFAULT_GLOBAL,
  DEFAULT_SYSTEM,
}
export type {GlobalSwatch, SystemToken}
