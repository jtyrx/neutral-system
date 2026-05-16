'use client'

/* eslint-disable @typescript-eslint/no-unused-vars -- optional label args mirror useNeutralWorkbench */

import type {SetStateAction} from 'react'
import {useCallback, useMemo, useState} from 'react'

import {DEFAULT_ALPHA_NEUTRAL_CONFIG, deriveAlphaBaseIndices} from '@/lib/neutral-engine/alphaNeutralTokens'
import {buildArchitectureRamps, rampForTheme} from '@/lib/neutral-engine/architectureRamps'
import {DEFAULT_SYSTEM_MAPPING} from '@/lib/neutral-engine/defaultSystemMapping'
import {applyContrastEmphasisToSystemMapping} from '@/lib/neutral-engine/effectiveMapping'
import {applyOkhslEdit, okhslViewFromConfig} from '@/lib/neutral-engine/okhsl'
import {clampSystemMappingToLadderLength, deriveBrandSurfaceToken, deriveSystemTokens} from '@/lib/neutral-engine/systemMap'
import {buildTokenView} from '@/lib/neutral-engine/tokenViews'
import type {
  AlphaNeutralConfig,
  GlobalScaleConfig,
  NeutralArchitectureMode,
  SystemMappingConfig,
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
import {maxInGamutChroma} from '@/lib/neutral-engine/gamutProbing'
import {
  globalScaleToPickerSecondary,
  globalScaleToPickerTriple,
  pickerToGlobalScale,
  type OklchPickerSecondary,
  type OklchPickerTriple,
} from '@/lib/neutral-engine/pickerConfig'
import Color from 'colorjs.io'

import {serializeColor, trimCssColorValue} from '@/lib/neutral-engine/serialize'

function serializePickerOklch(triple: OklchPickerTriple) {
  const L = Math.min(1, Math.max(0, triple.L))
  const C = Math.max(0, triple.C)
  const H = ((triple.H % 360) + 360) % 360
  return serializeColor(new Color('oklch', [L, C, H]))
}

export function useOklchPickerWorkbench() {
  const [neutralArchitecture, setNeutralArchitectureBase] = useState<NeutralArchitectureMode>('simple')
  const [globalScale, setGlobalScaleBase] = useState<GlobalScaleConfig>(DEFAULT_GLOBAL_SCALE_CONFIG)
  const [lightScale, setLightScaleBase] = useState<GlobalScaleConfig>(DEFAULT_ADVANCED_LIGHT_SCALE)
  const [darkScale, setDarkScaleBase] = useState<GlobalScaleConfig>(DEFAULT_ADVANCED_DARK_SCALE)
  const [systemConfigBase, setSystemConfigBase] = useState<SystemMappingConfig>(DEFAULT_SYSTEM_MAPPING)
  const [contrastEmphasis, setContrastEmphasisBase] = useState<ContrastEmphasis>('default')
  const [scaleEditTarget, setScaleEditTargetBase] = useState<'global' | 'light' | 'dark'>('light')
  const [selection, setSelection] = useState<WorkbenchSelection | null>(null)
  const [okhslEnabled, setOkhslEnabled] = useState(false)
  const [alphaConfig, setAlphaConfig] = useState<AlphaNeutralConfig>(DEFAULT_ALPHA_NEUTRAL_CONFIG)

  const setNeutralArchitecture = useCallback((next: NeutralArchitectureMode, _label?: string) => {
    setNeutralArchitectureBase(next)
    if (next === 'simple') setScaleEditTargetBase('global')
    else setScaleEditTargetBase((t) => (t === 'global' ? 'light' : t))
  }, [])

  const setGlobalScaleCfg = useCallback((action: SetStateAction<GlobalScaleConfig>, _label?: string) => {
    setGlobalScaleBase(action)
  }, [])

  const setLightScaleCfg = useCallback((action: SetStateAction<GlobalScaleConfig>, _label?: string) => {
    setLightScaleBase(action)
  }, [])

  const setDarkScaleCfg = useCallback((action: SetStateAction<GlobalScaleConfig>, _label?: string) => {
    setDarkScaleBase(action)
  }, [])

  const setSystemConfig = useCallback((action: SetStateAction<SystemMappingConfig>, _label?: string) => {
    setSystemConfigBase(action)
  }, [])

  const setContrastEmphasis = useCallback((value: ContrastEmphasis, _label?: string) => {
    setContrastEmphasisBase(value)
  }, [])

  const setScaleEditTarget = useCallback((t: 'global' | 'light' | 'dark') => {
    setScaleEditTargetBase(t)
  }, [])

  const patchGlobal = useCallback(
    <K extends keyof GlobalScaleConfig>(
      key: K,
      value: GlobalScaleConfig[K],
      _explicitLabel?: string,
    ) => {
      setGlobalScaleBase((prev) => (prev[key] === value ? prev : {...prev, [key]: value}))
    },
    [],
  )

  const patchLight = useCallback(
    <K extends keyof GlobalScaleConfig>(
      key: K,
      value: GlobalScaleConfig[K],
      _explicitLabel?: string,
    ) => {
      setLightScaleBase((prev) => (prev[key] === value ? prev : {...prev, [key]: value}))
    },
    [],
  )

  const patchDark = useCallback(
    <K extends keyof GlobalScaleConfig>(
      key: K,
      value: GlobalScaleConfig[K],
      _explicitLabel?: string,
    ) => {
      setDarkScaleBase((prev) => (prev[key] === value ? prev : {...prev, [key]: value}))
    },
    [],
  )

  const patchSystem = useCallback(
    <K extends keyof SystemMappingConfig>(
      key: K,
      value: SystemMappingConfig[K],
      _explicitLabel?: string,
    ) => {
      setSystemConfigBase((prev) => (prev[key] === value ? prev : {...prev, [key]: value}))
    },
    [],
  )

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

  const systemConfig = useMemo(
    () => clampSystemMappingToLadderLength(ladderFormN, systemConfigBase),
    [ladderFormN, systemConfigBase],
  )

  const architectureRamps = useMemo(
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

  const lightRamp = useMemo(() => rampForTheme(architectureRamps, 'light'), [architectureRamps])
  const darkRamp = useMemo(() => rampForTheme(architectureRamps, 'darkElevated'), [architectureRamps])
  const global = lightRamp

  const lightTokens = useMemo(
    () => deriveSystemTokens(lightRamp, {...effectiveMappingLight, themeMode: 'light'}),
    [lightRamp, effectiveMappingLight],
  )

  const darkTokens = useMemo(
    () => deriveSystemTokens(darkRamp, {...effectiveMappingDark, themeMode: 'darkElevated'}),
    [darkRamp, effectiveMappingDark],
  )

  const lightTokenView = useMemo(() => buildTokenView(lightTokens), [lightTokens])
  const darkTokenView = useMemo(() => buildTokenView(darkTokens), [darkTokens])

  const alphaBaseIndices = useMemo(
    () => deriveAlphaBaseIndices(architectureRamps, lightTokens, darkTokens, alphaConfig),
    [architectureRamps, lightTokens, darkTokens, alphaConfig],
  )

  const okhslEditableConfig: GlobalScaleConfig =
    neutralArchitecture === 'simple'
      ? globalScale
      : scaleEditTarget === 'light'
        ? lightScale
        : scaleEditTarget === 'dark'
          ? darkScale
          : globalScale

  const picker: OklchPickerTriple = useMemo(
    () => globalScaleToPickerTriple(okhslEditableConfig),
    [okhslEditableConfig],
  )

  const secondary: OklchPickerSecondary = useMemo(
    () => globalScaleToPickerSecondary(okhslEditableConfig),
    [okhslEditableConfig],
  )

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
    (edit: OkhslEdit, _label = 'OKHSL') => {
      commitOkhslToTarget(applyOkhslEdit(okhslEditableConfig, edit))
    },
    [commitOkhslToTarget, okhslEditableConfig],
  )

  const setScaleConfigPreset = useCallback(
    (action: SetStateAction<GlobalScaleConfig>, _label?: string) => {
      if (neutralArchitecture === 'simple') {
        setGlobalScaleBase(action)
        return
      }
      if (scaleEditTarget === 'light') setLightScaleBase(action)
      else if (scaleEditTarget === 'dark') setDarkScaleBase(action)
      else setGlobalScaleBase(action)
    },
    [neutralArchitecture, scaleEditTarget],
  )

  const patchPicker = useCallback(
    (patch: Partial<OklchPickerTriple>) => {
      const triple = {...globalScaleToPickerTriple(okhslEditableConfig), ...patch}
      const sec = globalScaleToPickerSecondary(okhslEditableConfig)
      commitOkhslToTarget(pickerToGlobalScale(triple, sec, okhslEditableConfig))
    },
    [commitOkhslToTarget, okhslEditableConfig],
  )

  const patchSecondary = useCallback(
    (patch: Partial<OklchPickerSecondary>) => {
      commitOkhslToTarget({...okhslEditableConfig, ...patch})
    },
    [commitOkhslToTarget, okhslEditableConfig],
  )

  const selectGlobal = useCallback((index: number) => {
    setSelection({kind: 'global', index})
  }, [])

  const selectSystem = useCallback((id: string, theme?: ThemeMode) => {
    setSelection({kind: 'system', id, theme})
  }, [])

  const liveBrandSurfaceOklch = useMemo(() => {
    const light = deriveBrandSurfaceToken(lightRamp, effectiveMappingLight, 'light')
    const dark = deriveBrandSurfaceToken(darkRamp, effectiveMappingDark, 'darkElevated')
    return {
      light: trimCssColorValue(light?.serialized.oklchCss ?? 'oklch(0% 0 none)'),
      dark: trimCssColorValue(dark?.serialized.oklchCss ?? 'oklch(0% 0 none)'),
    }
  }, [lightRamp, darkRamp, effectiveMappingLight, effectiveMappingDark])

  const pickerColor = useMemo(() => serializePickerOklch(picker), [picker])

  const maxChromaForPickerLH = useMemo(
    () => maxInGamutChroma(picker.L, ((picker.H % 360) + 360) % 360),
    [picker.L, picker.H],
  )

  const resetToDefaults = useCallback(() => {
    setNeutralArchitectureBase('simple')
    setGlobalScaleBase(DEFAULT_GLOBAL_SCALE_CONFIG)
    setLightScaleBase(DEFAULT_ADVANCED_LIGHT_SCALE)
    setDarkScaleBase(DEFAULT_ADVANCED_DARK_SCALE)
    setSystemConfigBase(DEFAULT_SYSTEM_MAPPING)
    setContrastEmphasisBase('default')
    setScaleEditTargetBase('light')
    setSelection(null)
    setOkhslEnabled(false)
    setAlphaConfig(DEFAULT_ALPHA_NEUTRAL_CONFIG)
  }, [])

  return useMemo(
    () => ({
      mode: 'sandbox' as const,
      neutralArchitecture,
      setNeutralArchitecture,
      globalScale,
      lightScale,
      darkScale,
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
      effectiveMappingLight,
      effectiveMappingDark,
      contrastEmphasis,
      setContrastEmphasis,
      architectureRamps,
      lightRamp,
      darkRamp,
      global,
      lightTokens,
      darkTokens,
      lightTokenView,
      darkTokenView,
      activeTokenView: lightTokenView as TokenView,
      selection,
      setSelection,
      selectGlobal,
      selectSystem,
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
      liveBrandSurfaceOklch,
      picker,
      patchPicker,
      secondary,
      patchSecondary,
      pickerColor,
      maxChromaForPickerLH,
      resetToDefaults,
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
      effectiveMappingLight,
      effectiveMappingDark,
      contrastEmphasis,
      setContrastEmphasis,
      architectureRamps,
      lightRamp,
      darkRamp,
      global,
      lightTokens,
      darkTokens,
      lightTokenView,
      darkTokenView,
      selection,
      selectGlobal,
      selectSystem,
      okhslEnabled,
      setOkhslEnabled,
      scaleEditTarget,
      setScaleEditTarget,
      okhslView,
      okhslEditableConfig,
      setGlobalConfigFromOkhsl,
      alphaConfig,
      alphaBaseIndices,
      liveBrandSurfaceOklch,
      picker,
      patchPicker,
      secondary,
      patchSecondary,
      pickerColor,
      maxChromaForPickerLH,
      resetToDefaults,
    ],
  )
}

export type OklchPickerWorkbenchState = ReturnType<typeof useOklchPickerWorkbench>
