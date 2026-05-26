/**
 * Persists Neutral workbench input state to `localStorage` (native Web Storage API).
 * `previewTheme` is intentionally excluded — synced from `next-themes` via `{@link WorkbenchThemeBridge}`.
 */

import {DEFAULT_ALPHA_NEUTRAL_CONFIG} from '@/lib/neutral-engine/alphaNeutralTokens'
import {
  DEFAULT_ADVANCED_DARK_SCALE,
  DEFAULT_ADVANCED_LIGHT_SCALE,
  DEFAULT_GLOBAL_SCALE_CONFIG,
} from '@/lib/neutral-engine/defaultGlobalScaleConfig'
import {
  DEFAULT_SYSTEM_MAPPING,
  migrateSystemMappingConfig,
} from '@/lib/neutral-engine/defaultSystemMapping'
import {clampGlobalScaleSteps} from '@/lib/neutral-engine/globalScale'
import {presetDebugEnabled} from '@/lib/debug/presetDebug'
import type {ContrastModel} from '@/lib/neutral-engine/contrastModel'
import type {ContrastEmphasis} from '@/lib/neutral-engine/semanticNaming'
import type {
  AlphaNeutralConfig,
  GlobalScaleConfig,
  NeutralArchitectureMode,
  SystemMappingConfig,
  WorkbenchSelection,
} from '@/lib/neutral-engine/types'

/** Same union as `PreviewComparison`; kept in lib to avoid coupling to components. */
export type WorkbenchComparisonLayout = 'split' | 'focus'

export const WORKBENCH_STORAGE_KEY = 'neutral-system:workbench:v1' as const

export type WorkbenchPersistedPayloadV2 = {
  v: 2
  neutralArchitecture: NeutralArchitectureMode
  globalScale: GlobalScaleConfig
  lightScale: GlobalScaleConfig
  darkScale: GlobalScaleConfig
  systemConfig: SystemMappingConfig
  contrastEmphasis: ContrastEmphasis
  comparisonLayout: WorkbenchComparisonLayout
  showContrastPairs: boolean
  inspectionMode: boolean
  okhslEnabled: boolean
  scaleEditTarget: 'global' | 'light' | 'dark'
  alphaConfig: AlphaNeutralConfig
  selection: WorkbenchSelection | null
  contrastModel: ContrastModel
}

export type WorkbenchPersistedPayloadV1 = {
  v: 1
  neutralArchitecture: NeutralArchitectureMode
  globalScale: GlobalScaleConfig
  lightScale: GlobalScaleConfig
  darkScale: GlobalScaleConfig
  systemConfig: SystemMappingConfig
  contrastEmphasis: ContrastEmphasis
  comparisonLayout: WorkbenchComparisonLayout
  showContrastPairs: boolean
  inspectionMode: boolean
  okhslEnabled: boolean
  scaleEditTarget: 'global' | 'light' | 'dark'
  alphaConfig: AlphaNeutralConfig
  selection: WorkbenchSelection | null
}

/** Migrates a single GlobalScaleConfig from v1 (lCurve cluster) to v2 (lightnessModel). */
export function migrateGlobalScaleV1toV2(config: GlobalScaleConfig): GlobalScaleConfig {
  if (presetDebugEnabled() && config.lCurveStrengthA !== config.lCurveStrengthB &&
      config.lCurveStrengthA !== undefined && config.lCurveStrengthB !== undefined) {
    console.warn('[presetDebug] v1→v2 migration: asymmetric lCurveStrengthA/B collapsed to midpoint:0.5')
  }
  const {lCurve: _lCurve, lCurveStrength: _lCurveStrength, lCurveStrengthA: _a, lCurveStrengthB: _b, pivotIndex: _pi, ...rest} = config
  return {...rest, lightnessModel: {kind: 'linear-oklch', midpoint: 0.5}}
}

function migrateV1toV2(payload: WorkbenchPersistedPayloadV1): WorkbenchPersistedPayloadV2 {
  return {
    ...payload,
    v: 2,
    globalScale: migrateGlobalScaleV1toV2(payload.globalScale),
    lightScale: migrateGlobalScaleV1toV2(payload.lightScale),
    darkScale: migrateGlobalScaleV1toV2(payload.darkScale),
    contrastModel: 'wcag-2.1',
  }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

function mergeGlobalScale(base: GlobalScaleConfig, patch: unknown): GlobalScaleConfig {
  if (!isRecord(patch)) {
    return {
      ...base,
      steps: clampGlobalScaleSteps(base.steps),
    }
  }
  return {
    ...base,
    ...patch,
    steps: clampGlobalScaleSteps(
      typeof patch.steps === 'number' ? patch.steps : base.steps,
    ),
  } as GlobalScaleConfig
}

function coerceArchitecture(v: unknown): NeutralArchitectureMode | null {
  return v === 'simple' || v === 'advanced' ? v : null
}

function coerceContrast(v: unknown): ContrastEmphasis | null {
  return v === 'subtle' || v === 'default' || v === 'strong' || v === 'inverse'
    ? v
    : null
}

function coerceScaleEdit(v: unknown): 'global' | 'light' | 'dark' | null {
  return v === 'global' || v === 'light' || v === 'dark' ? v : null
}

function coerceLayout(v: unknown): WorkbenchComparisonLayout | null {
  return v === 'split' || v === 'focus' ? v : null
}

function coerceContrastModel(v: unknown): ContrastModel {
  return v === 'apca' || v === 'wcag-2.1' ? v : 'wcag-2.1'
}

function coerceSelection(v: unknown): WorkbenchSelection | null {
  if (!isRecord(v)) return null
  if (v.kind === 'global' && typeof v.index === 'number') {
    return {kind: 'global', index: v.index}
  }
  if (v.kind === 'system' && typeof v.id === 'string') {
    const theme =
      v.theme === 'light' || v.theme === 'darkElevated' ? v.theme : undefined
    return {kind: 'system', id: v.id, theme}
  }
  return null
}

/**
 * Parses and normalizes persisted JSON into a safe v2 payload, or returns `null` if invalid /
 * unreadable. Transparently migrates v1 payloads on read.
 */
export function parsePersistedWorkbench(
  raw: string | null,
): WorkbenchPersistedPayloadV2 | null {
  if (raw == null || raw === '') return null
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null
    const isV1 = parsed.v === 1
    const isV2 = parsed.v === 2
    if (!isV1 && !isV2) return null

    const arch = coerceArchitecture(parsed.neutralArchitecture)
    if (!arch) return null

    const globalScale = mergeGlobalScale(
      DEFAULT_GLOBAL_SCALE_CONFIG,
      parsed.globalScale,
    )
    const lightScale = mergeGlobalScale(
      DEFAULT_ADVANCED_LIGHT_SCALE,
      parsed.lightScale,
    )
    const darkScale = mergeGlobalScale(
      DEFAULT_ADVANCED_DARK_SCALE,
      parsed.darkScale,
    )

    const systemConfig = migrateSystemMappingConfig(
      (parsed.systemConfig as SystemMappingConfig | undefined) ??
        DEFAULT_SYSTEM_MAPPING,
    )

    const contrast = coerceContrast(parsed.contrastEmphasis) ?? 'default'
    const comparisonLayout = coerceLayout(parsed.comparisonLayout) ?? 'split'

    let scaleEdit = coerceScaleEdit(parsed.scaleEditTarget) ?? 'light'
    if (arch === 'simple') scaleEdit = 'global'

    const alpha = isRecord(parsed.alphaConfig)
      ? {...DEFAULT_ALPHA_NEUTRAL_CONFIG, ...parsed.alphaConfig}
      : DEFAULT_ALPHA_NEUTRAL_CONFIG

    const v2Payload: WorkbenchPersistedPayloadV2 = {
      v: 2,
      neutralArchitecture: arch,
      globalScale,
      lightScale,
      darkScale,
      systemConfig,
      contrastEmphasis: contrast,
      comparisonLayout,
      showContrastPairs: Boolean(parsed.showContrastPairs),
      inspectionMode: Boolean(parsed.inspectionMode),
      okhslEnabled: Boolean(parsed.okhslEnabled),
      scaleEditTarget: scaleEdit,
      alphaConfig: alpha as AlphaNeutralConfig,
      selection: coerceSelection(parsed.selection),
      contrastModel: coerceContrastModel(parsed.contrastModel),
    }
    return isV1 ? migrateV1toV2(v2Payload as unknown as WorkbenchPersistedPayloadV1) : v2Payload
  } catch {
    return null
  }
}

export function readWorkbenchFromStorage(): WorkbenchPersistedPayloadV2 | null {
  if (typeof window === 'undefined') return null
  try {
    return parsePersistedWorkbench(localStorage.getItem(WORKBENCH_STORAGE_KEY))
  } catch {
    return null
  }
}

export function writeWorkbenchToStorage(payload: WorkbenchPersistedPayloadV2): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(WORKBENCH_STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Quota / private mode — ignore
  }
}
