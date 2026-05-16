'use client'

import type {SetStateAction} from 'react'
import Color from 'colorjs.io'

import type {OklchPickerWorkbenchState} from '@/hooks/useOklchPickerWorkbench'
import type {NeutralWorkbench} from '@/hooks/useNeutralWorkbench'
import {DEFAULT_SYSTEM} from '@/hooks/useNeutralWorkbench'
import {DEFAULT_ALPHA_NEUTRAL_CONFIG} from '@/lib/neutral-engine/alphaNeutralTokens'
import {
  DEFAULT_ADVANCED_DARK_SCALE,
  DEFAULT_ADVANCED_LIGHT_SCALE,
  DEFAULT_GLOBAL_SCALE_CONFIG,
} from '@/lib/neutral-engine/defaultGlobalScaleConfig'
import type {ContrastEmphasis} from '@/lib/neutral-engine/semanticNaming'
import {clampGlobalScaleSteps} from '@/lib/neutral-engine/globalScale'
import {maxInGamutChroma} from '@/lib/neutral-engine/gamutProbing'
import {
  globalScaleToPickerSecondary,
  globalScaleToPickerTriple,
  pickerToGlobalScale,
  type OklchPickerSecondary,
  type OklchPickerTriple,
} from '@/lib/neutral-engine/pickerConfig'
import {serializeColor} from '@/lib/neutral-engine/serialize'
import type {TokenView} from '@/lib/neutral-engine/tokenViews'
import type {
  AlphaNeutralConfig,
  ArchitectureRamps,
  GlobalScaleConfig,
  GlobalSwatch,
  NeutralArchitectureMode,
  SerializedColor,
  SystemMappingConfig,
  SystemToken,
  WorkbenchSelection,
} from '@/lib/neutral-engine/types'
import type {OkhslEdit, OkhslView} from '@/lib/neutral-engine/okhsl'

export type WorkbenchAdapterMode = 'live' | 'sandbox'

/** Unified surface for {@link OklchPickerPanel} + legacy control sections (live or sandbox). */
export type WorkbenchAdapter = {
  mode: WorkbenchAdapterMode
  neutralArchitecture: NeutralArchitectureMode
  setNeutralArchitecture: (next: NeutralArchitectureMode, label?: string) => void
  globalScale: GlobalScaleConfig
  lightScale: GlobalScaleConfig
  darkScale: GlobalScaleConfig
  globalConfig: GlobalScaleConfig
  setGlobalScale: (action: SetStateAction<GlobalScaleConfig>, label?: string) => void
  setLightScale: (action: SetStateAction<GlobalScaleConfig>, label?: string) => void
  setDarkScale: (action: SetStateAction<GlobalScaleConfig>, label?: string) => void
  patchGlobal: <K extends keyof GlobalScaleConfig>(
    key: K,
    value: GlobalScaleConfig[K],
    label?: string,
  ) => void
  patchLight: <K extends keyof GlobalScaleConfig>(
    key: K,
    value: GlobalScaleConfig[K],
    label?: string,
  ) => void
  patchDark: <K extends keyof GlobalScaleConfig>(
    key: K,
    value: GlobalScaleConfig[K],
    label?: string,
  ) => void
  setScaleConfigPreset: (action: SetStateAction<GlobalScaleConfig>, label?: string) => void
  ladderLightSteps: number
  ladderDarkSteps: number
  ladderGlobalSteps?: number
  systemConfig: SystemMappingConfig
  setSystemConfig: (action: SetStateAction<SystemMappingConfig>, label?: string) => void
  patchSystem: <K extends keyof SystemMappingConfig>(
    key: K,
    value: SystemMappingConfig[K],
    label?: string,
  ) => void
  effectiveMappingLight: SystemMappingConfig
  effectiveMappingDark: SystemMappingConfig
  contrastEmphasis: ContrastEmphasis
  setContrastEmphasis: (value: ContrastEmphasis, label?: string) => void
  architectureRamps: ArchitectureRamps
  lightRamp: GlobalSwatch[]
  darkRamp: GlobalSwatch[]
  global: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  activeTokenView: TokenView
  selection: WorkbenchSelection | null
  setSelection: (s: WorkbenchSelection | null) => void
  selectGlobal: (index: number) => void
  okhslEnabled: boolean
  setOkhslEnabled: (v: boolean | ((prev: boolean) => boolean)) => void
  scaleEditTarget: 'global' | 'light' | 'dark'
  setScaleEditTarget: (t: 'global' | 'light' | 'dark') => void
  okhslView: OkhslView
  okhslEditableConfig: GlobalScaleConfig
  setGlobalConfigFromOkhsl: (edit: OkhslEdit, label?: string) => void
  alphaConfig: AlphaNeutralConfig
  setAlphaConfig: (action: SetStateAction<AlphaNeutralConfig>) => void
  alphaBaseIndices: {lightBase: number; darkBase: number}
  liveBrandSurfaceOklch?: {light: string; dark: string}
  picker: OklchPickerTriple
  patchPicker: (patch: Partial<OklchPickerTriple>) => void
  secondary: OklchPickerSecondary
  patchSecondary: (patch: Partial<OklchPickerSecondary>) => void
  pickerColor: SerializedColor
  maxChromaForPickerLH: number
  resetToDefaults: () => void
}

function serializePickerOklch(triple: OklchPickerTriple): SerializedColor {
  const L = Math.min(1, Math.max(0, triple.L))
  const C = Math.max(0, triple.C)
  const H = ((triple.H % 360) + 360) % 360
  return serializeColor(new Color('oklch', [L, C, H]))
}

/** Map live workbench API → adapter (picker pin derived from active edit target). */
export function liveWorkbenchAdapter(wb: NeutralWorkbench): WorkbenchAdapter {
  const cfg = wb.okhslEditableConfig
  const picker = globalScaleToPickerTriple(cfg)
  const secondary = globalScaleToPickerSecondary(cfg)

  const patchPicker = (patch: Partial<OklchPickerTriple>) => {
    const c = wb.okhslEditableConfig
    wb.setScaleConfigPreset(
      pickerToGlobalScale(
        {...globalScaleToPickerTriple(c), ...patch},
        globalScaleToPickerSecondary(c),
        c,
      ),
    )
  }

  const patchSecondary = (patch: Partial<OklchPickerSecondary>) => {
    wb.setScaleConfigPreset({...wb.okhslEditableConfig, ...patch})
  }

  const pickerColor = serializePickerOklch(picker)
  const maxChromaForPickerLH = maxInGamutChroma(picker.L, ((picker.H % 360) + 360) % 360)

  const resetToDefaults = () => {
    wb.setNeutralArchitecture('advanced', 'Picker · Reset')
    wb.setGlobalScale(
      {
        ...DEFAULT_GLOBAL_SCALE_CONFIG,
        steps: clampGlobalScaleSteps(DEFAULT_GLOBAL_SCALE_CONFIG.steps),
      },
      'Picker · Reset',
    )
    wb.setLightScale(
      () => ({
        ...DEFAULT_ADVANCED_LIGHT_SCALE,
        steps: clampGlobalScaleSteps(DEFAULT_ADVANCED_LIGHT_SCALE.steps),
      }),
      'Picker · Reset',
    )
    wb.setDarkScale(
      () => ({
        ...DEFAULT_ADVANCED_DARK_SCALE,
        steps: clampGlobalScaleSteps(DEFAULT_ADVANCED_DARK_SCALE.steps),
      }),
      'Picker · Reset',
    )
    wb.setSystemConfig(DEFAULT_SYSTEM, 'Picker · Reset')
    wb.setContrastEmphasis('default', 'Picker · Reset')
    wb.setScaleEditTarget('light')
    wb.setSelection(null)
    wb.setOkhslEnabled(false)
    wb.setAlphaConfig(DEFAULT_ALPHA_NEUTRAL_CONFIG)
  }

  return {
    mode: 'live',
    ...wb,
    picker,
    patchPicker,
    secondary,
    patchSecondary,
    pickerColor,
    maxChromaForPickerLH,
    resetToDefaults,
  } as WorkbenchAdapter
}

/** Sandbox hook return is already adapter-shaped; narrow for callers. */
export function sandboxWorkbenchAdapter(s: OklchPickerWorkbenchState): WorkbenchAdapter {
  return s as WorkbenchAdapter
}
