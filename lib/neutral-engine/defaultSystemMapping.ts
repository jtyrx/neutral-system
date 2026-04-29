import { DEFAULT_BRAND_OKLCH } from '@/lib/neutral-engine/brandColor'
import { trimCssColorValue } from '@/lib/neutral-engine/serialize'
import type { SystemMappingConfig } from '@/lib/neutral-engine/types'
import {
  BORDER_STANDARD_SLOT_COUNT,
  SURFACE_STANDARD_COUNT_MAX,
  SURFACE_STANDARD_COUNT_MIN,
  TEXT_STANDARD_SLOT_COUNT,
} from '@/lib/neutral-engine/semanticNaming'

/** Canonical defaults for system mapping; used by the workbench and preset migration. */
/** Wide-mode baseline: canonical seed for Light + Dark elevated (see product defaults). */
export const DEFAULT_SYSTEM_MAPPING: SystemMappingConfig = {
  fillStart: 0,                // Index where fill slots start in the palette (light mode)
  strokeStart: 4,              // Index where stroke slots start in the palette (light mode)
  textStart: 34,               // Legacy 41-step seed; ladder clamp recomputes from steps × count × interval
  fillCount: 5,                // Standard surface ladder (sunken → overlay); inverse is separate
  strokeCount: 4,              // Saved presets may use 4; engine clamps border ladder to max 3 (`BORDER_STANDARD_SLOT_COUNT`). `border.focus` is separate.
  textCount: 5,                // Standard text ladder (default → disabled); text.on is separate
  darkFillStart: 0,            // Index where fill slots start from the dark edge of the palette
  darkStrokeStart: 2,          // Index where stroke slots start in the palette (dark mode)
  darkTextStart: 15,           // Legacy 41-step seed; ladder clamp recomputes from steps × count × interval
  darkFillCount: 5,            // Standard surface ladder (dark elevated)
  darkStrokeCount: 4,          // Same clamp as `strokeCount`: max effective border ladder is 3. `border.focus` is separate.
  darkTextCount: 5,            // Standard text ladder (dark elevated)
  altCount: 2,                 // Number of alternative slots/groups to allocate
  lightFillStepInterval: 1,    // Step interval between fills in light mode
  lightStrokeStepInterval: 1,  // Step interval between strokes in light mode
  lightTextStepInterval: 2,    // Step interval between text slots in light mode
  darkFillStepInterval: 1,     // Step interval between fills in dark mode
  darkStrokeStepInterval: 1,   // Step interval between strokes in dark mode
  darkTextStepInterval: 2,     // Step interval between text slots in dark mode
  contrastDistance: 1,         // Integer distance to increase contrast group separation
  themeMode: 'light',          // Starting theme mode; can be 'light' or 'dark'
  darkSegmentLength: 8,        // Segment length for dark mode palette linear mappings
  altAlpha: 0.45,              // Alpha value to use for alternative slots
  includeContrastGroups: false,// Whether to include explicit contrast groups in mapping
  brandOklch: DEFAULT_BRAND_OKLCH,
}

type PartialSystemWithLegacy = Partial<SystemMappingConfig> & { stepInterval?: number }

/** Merge partial config (e.g. imported JSON) with defaults and legacy dark-field migration. Text starts are ladder‑fitted in {@link clampSystemMappingToLadderLength} — there is no `darkTextStart = textStart + 2` fallback. */
export function migrateSystemMappingConfig(partial: PartialSystemWithLegacy): SystemMappingConfig {
  const { stepInterval: legacyStepInterval, ...rest } = partial
  const m: SystemMappingConfig = { ...DEFAULT_SYSTEM_MAPPING, ...rest }
  if (partial.darkFillStart === undefined) m.darkFillStart = m.fillStart
  if (partial.darkStrokeStart === undefined) m.darkStrokeStart = m.strokeStart
  if (partial.darkFillCount === undefined) m.darkFillCount = m.fillCount
  if (partial.darkStrokeCount === undefined) m.darkStrokeCount = m.strokeCount
  if (partial.darkTextCount === undefined) m.darkTextCount = m.textCount

  m.fillCount = Math.min(SURFACE_STANDARD_COUNT_MAX, Math.max(SURFACE_STANDARD_COUNT_MIN, Math.round(m.fillCount)))
  m.strokeCount = Math.min(BORDER_STANDARD_SLOT_COUNT, Math.max(1, Math.round(m.strokeCount)))
  m.textCount = Math.min(TEXT_STANDARD_SLOT_COUNT, Math.max(1, Math.round(m.textCount)))
  m.darkFillCount = Math.min(SURFACE_STANDARD_COUNT_MAX, Math.max(SURFACE_STANDARD_COUNT_MIN, Math.round(m.darkFillCount)))
  m.darkStrokeCount = Math.min(BORDER_STANDARD_SLOT_COUNT, Math.max(1, Math.round(m.darkStrokeCount)))
  m.darkTextCount = Math.min(TEXT_STANDARD_SLOT_COUNT, Math.max(1, Math.round(m.darkTextCount)))

  if (typeof m.brandOklch !== 'string' || !m.brandOklch.trim()) {
    m.brandOklch = DEFAULT_SYSTEM_MAPPING.brandOklch
  } else {
    m.brandOklch = trimCssColorValue(m.brandOklch)
  }

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
