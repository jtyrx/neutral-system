export type Progression = 'linear'

export type ChromaMode = 'achromatic' | 'fixed' | 'taper_mid' | 'taper_ends'

export type NamingStyle = 'numeric_desc' | 'semantic' | 'token_ladder'

export type ThemeMode = 'light' | 'darkElevated' | 'darkDeep'

export type NeutralVariantId = 'pure' | 'warm' | 'cool' | 'bluish' | 'custom'

export type GlobalScaleConfig = {
  steps: number
  /** OKLCH L, 0–1 (lightest). */
  lHigh: number
  /** OKLCH L, 0–1 (darkest). */
  lLow: number
  progression: Progression
  chromaMode: ChromaMode
  /** Max chroma used when not achromatic (OKLCH C). */
  baseChroma: number
  /** Hue in degrees; ignored when variant is pure achromatic. */
  hue: number
  namingStyle: NamingStyle
  variantId: NeutralVariantId
}

export type SerializedColor = {
  oklchCss: string
  hex: string
  rgbCss: string
  srgbCss: string
  inSrgbGamut: boolean
}

export type GlobalSwatch = {
  index: number
  label: string
  serialized: SerializedColor
}

/**
 * Semantic role id (same as `SystemToken.name`): dot-path roles, e.g. `surface.default`, `text.muted`,
 * `border.focus`, `state.hover`, `emphasis.surface.0`.
 */
export type SystemRole = string

export type SystemMappingConfig = {
  /** Light theme: surface / border / text ladder starts (low index = light end). Internal field name `fill*` is legacy. */
  fillStart: number
  strokeStart: number
  textStart: number
  /** Shades per role (each role lists `count` tokens). */
  fillCount: number
  strokeCount: number
  textCount: number
  /**
   * Dark elevated: independent role controls (passed to dark-edge pickers).
   * Legacy presets without these fields migrate from light fields (+2 for text start).
   */
  darkFillStart: number
  darkStrokeStart: number
  darkTextStart: number
  darkFillCount: number
  darkStrokeCount: number
  darkTextCount: number
  altCount: number
  /**
   * Base step between ladder picks for each role (× contrast distance in the engine).
   * Light theme: fills / strokes / text.
   */
  lightFillStepInterval: number
  lightStrokeStepInterval: number
  lightTextStepInterval: number
  /** Dark elevated: fills / strokes / text. */
  darkFillStepInterval: number
  darkStrokeStepInterval: number
  darkTextStepInterval: number
  /** Multiplier ≥1 widens spacing between mapped indices (contrast personality). */
  contrastDistance: number
  themeMode: ThemeMode
  /** For dark themes: use the last `darkSegmentLength` global steps as the pool. */
  darkSegmentLength: number
  /** Alpha for alt / overlay tokens (0–1). */
  altAlpha: number
  includeContrastGroups: boolean
  /**
   * Custom OKLCH for `surface.brand` (user-editable). Invalid strings fall back to ramp-derived brand
   * in the engine while keeping this field as typed by the user.
   */
  brandOklch: string
}

export type SystemToken = {
  id: string
  name: string
  role: SystemRole
  theme: ThemeMode
  sourceGlobalIndex: number
  serialized: SerializedColor
  alpha?: number
  /**
   * When true, exports use `serialized.oklchCss` directly (not `var(--color-neutral-*)` from ramp).
   * Used for `surface.brand` when `brandOklch` parses successfully.
   */
  customColor?: boolean
}

export type PreviewTheme = 'light' | 'dark'

export type WorkbenchSelection =
  | { kind: 'global'; index: number }
  | { kind: 'system'; id: string; theme?: ThemeMode }
