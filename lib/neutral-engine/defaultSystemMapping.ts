import type {SystemMappingConfig} from '@/lib/neutral-engine/types'
import {
  SURFACE_STANDARD_COUNT_MAX,
  SURFACE_STANDARD_COUNT_MIN,
  TEXT_STANDARD_SLOT_COUNT,
} from '@/lib/neutral-engine/semanticNaming'

/** Canonical defaults for system mapping; used by the workbench and preset migration. */
/** Wide-mode baseline: canonical seed for Light + Dark elevated (see product defaults). */
export const DEFAULT_SYSTEM_MAPPING: SystemMappingConfig = {
  fillStart: 0,
  strokeStart: 4,
  textStart: 34,
  fillCount: 4,
  strokeCount: 3,
  textCount: 4,
  darkFillStart: 0,
  darkStrokeStart: 2,
  darkTextStart: 15,
  darkFillCount: 4,
  darkStrokeCount: 3,
  darkTextCount: 4,
  altCount: 2,
  lightFillStepInterval: 1,
  lightStrokeStepInterval: 1,
  lightTextStepInterval: 2,
  darkFillStepInterval: 1,
  darkStrokeStepInterval: 1,
  darkTextStepInterval: 2,
  contrastDistance: 1,
  themeMode: 'light',
  darkSegmentLength: 8,
  altAlpha: 0.45,
  includeContrastGroups: false,
}

type PartialSystemWithLegacy = Partial<SystemMappingConfig> & {stepInterval?: number}

/** Merge partial config (e.g. imported JSON) with defaults and legacy dark-field migration. */
export function migrateSystemMappingConfig(partial: PartialSystemWithLegacy): SystemMappingConfig {
  const {stepInterval: legacyStepInterval, ...rest} = partial
  const m: SystemMappingConfig = {...DEFAULT_SYSTEM_MAPPING, ...rest}
  if (partial.darkFillStart === undefined) m.darkFillStart = m.fillStart
  if (partial.darkStrokeStart === undefined) m.darkStrokeStart = m.strokeStart
  if (partial.darkTextStart === undefined) m.darkTextStart = m.textStart + 2
  if (partial.darkFillCount === undefined) m.darkFillCount = m.fillCount
  if (partial.darkStrokeCount === undefined) m.darkStrokeCount = m.strokeCount
  if (partial.darkTextCount === undefined) m.darkTextCount = m.textCount

  m.fillCount = Math.min(SURFACE_STANDARD_COUNT_MAX, Math.max(SURFACE_STANDARD_COUNT_MIN, Math.round(m.fillCount)))
  m.textCount = Math.min(TEXT_STANDARD_SLOT_COUNT, Math.max(1, Math.round(m.textCount)))
  m.darkFillCount = Math.min(SURFACE_STANDARD_COUNT_MAX, Math.max(SURFACE_STANDARD_COUNT_MIN, Math.round(m.darkFillCount)))
  m.darkTextCount = Math.min(TEXT_STANDARD_SLOT_COUNT, Math.max(1, Math.round(m.darkTextCount)))

  if (legacyStepInterval !== undefined && Number.isFinite(legacyStepInterval)) {
    if (rest.lightFillStepInterval === undefined) m.lightFillStepInterval = legacyStepInterval
    if (rest.lightStrokeStepInterval === undefined) m.lightStrokeStepInterval = legacyStepInterval
    if (rest.lightTextStepInterval === undefined) m.lightTextStepInterval = legacyStepInterval
    if (rest.darkFillStepInterval === undefined) m.darkFillStepInterval = legacyStepInterval
    if (rest.darkStrokeStepInterval === undefined) m.darkStrokeStepInterval = legacyStepInterval
    if (rest.darkTextStepInterval === undefined) m.darkTextStepInterval = legacyStepInterval
  }

  return m
}
