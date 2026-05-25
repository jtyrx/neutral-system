export type Progression = 'linear'

export type ChromaMode = 'achromatic' | 'fixed' | 'taper_mid' | 'taper_ends'

export type LCurve = 'linear' | 'ease-in-dark' | 'ease-out-light' | 's-curve'

export type NamingStyle = 'numeric_desc' | 'semantic' | 'token_ladder'

export type ThemeMode = 'light' | 'darkElevated'

/**
 * Neutral palette architecture — independent ramps (advanced, default) vs one global flipped ramp (legacy).
 */
export type NeutralArchitectureMode = 'advanced' | 'simple'

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
  /** Lightness distribution curve. Defaults to `'linear'` when omitted. */
  lCurve?: LCurve | undefined
  /**
   * Blend from linear lightness spacing into the curve from `lCurve`.
   * `0` = fully linear ramp; `1` = full selected curve. Defaults to `1` when omitted.
   */
  lCurveStrength?: number | undefined
  /**
   * Per-segment curve strength. When either A or B is set, the ramp is split at `pivotIndex`.
   * Stops with index `< pivotIndex` use `lCurveStrengthA`; stops `>= pivotIndex` use `lCurveStrengthB`.
   * Falls back to `lCurveStrength` when a segment value is undefined.
   */
  lCurveStrengthA?: number | undefined
  lCurveStrengthB?: number | undefined
  /** Absolute stop index splitting A and B segments. Defaults to `8`. */
  pivotIndex?: number | undefined
  /**
   * Per-end chroma override. When both are set, chroma is interpolated from `chromaLight`
   * (t=0, light end) to `chromaDark` (t=1, dark end), then shaped by `chromaMode`.
   * When either is absent, `baseChroma` is used for both ends (current behaviour).
   */
  chromaLight?: number | undefined
  chromaDark?: number | undefined
  /**
   * Hue at the light and dark ends (degrees). When both are set and unequal, hue is
   * interpolated via Oklab `range()` so the drift is perceptually smooth. Requires
   * `chromaMode !== 'achromatic'`; ignored otherwise.
   */
  hueLight?: number | undefined
  hueDark?: number | undefined
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

export type GlobalScaleDirection = 'light-to-dark' | 'dark-to-light'

/** Engine-resolved ramps for derivation and export (immutable shape). */
export type ArchitectureRamps =
  | {architecture: 'simple'; global: GlobalSwatch[]; dark: GlobalSwatch[]}
  | {architecture: 'advanced'; light: GlobalSwatch[]; dark: GlobalSwatch[]}

/**
 * Roles emitted by `deriveSystemTokens` (stable dot paths). Overflow ladders use `*.layer-*`;
 * emphasis uses `emphasis.{surface|border|text}.*`.
 */
export type KnownSystemRole =
  | 'surface.sunken'
  | 'surface.default'
  | 'surface.subtle'
  | 'surface.raised'
  | 'surface.overlay'
  | 'surface.brand'
  | 'surface.inverse'
  | 'border.default'
  | 'border.subtle'
  | 'border.strong'
  | 'border.focus'
  | 'text.default'
  | 'text.subtle'
  | 'text.muted'
  | 'text.disabled'
  | 'text.inverse'
  | 'text.brand'
  | 'border.inverse'
  | 'border.brand'
  | 'overlay.scrim'
  | 'state.hover'

export type EmphasisSystemRole =
  | `emphasis.surface.${string}`
  | `emphasis.border.${string}`
  | `emphasis.text.${string}`

export type OverflowSystemRole =
  | `surface.layer-${string}`
  | `border.layer-${string}`
  | `text.layer-${string}`
  | `state.layer-${string}`

/**
 * Semantic role id (same as `SystemToken.name`): dot-path roles, e.g. `surface.default`, `text.muted`,
 * `border.focus`, `state.hover`, `emphasis.surface.0`.
 */
export type SystemRole = KnownSystemRole | EmphasisSystemRole | OverflowSystemRole

export type SystemMappingConfig = {
  /** Light theme: `fill*` = **surface** ladder on the global ramp (legacy field name); `stroke*` = **border** ladder. */
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
   * Text role picking strategy.
   * - `'arithmetic'` (default): deterministic step-interval walks — current behaviour.
   * - `'contrast'`: each text slot finds the nearest index meeting its WCAG target against
   *   `surface.default`. Surface and border picks are unaffected.
   */
  roleMappingMode?: 'arithmetic' | 'contrast'
  /**
   * Custom OKLCH for brand-pair tokens (`surface.brand`, `text.brand`, `border.brand`).
   * Invalid strings fall back to ramp-derived values while keeping this field as typed by the user.
   */
  brandOklch: string
  /**
   * Per-role primitive step overrides. When set for a role, the override index
   * replaces the arithmetic pick from the ladder mapping — independently for each theme.
   * Key is the SystemRole dot-path (e.g. `"surface.raised"`).
   */
  roleStepOverrides?: Partial<Record<string, {light?: number; dark?: number}>> | undefined
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
   * When true, exports use `serialized.oklchCss` directly (not `var(--color-neutral-*)` from the ramp).
   * Set on all brand-pair tokens (`surface.brand`, `text.brand`, `border.brand`) when `brandOklch` parses.
   */
  customColor?: boolean
  /** DTCG token type — always 'color' for system tokens */
  $type: 'color'
  /** Optional DTCG description — design rationale for this role */
  $description?: string
}

export type PreviewTheme = 'light' | 'dark'

export type WorkbenchSelection =
  | { kind: 'global'; index: number }
  | { kind: 'system'; id: string; theme?: ThemeMode | undefined }

/**
 * Configuration for alpha neutral token derivation.
 * Base indices are resolved from `text.default` per theme by default.
 * `lightIndexOffset` / `darkIndexOffset` nudge the base index ±N steps on the ramp.
 * `alphaStops` are the four opacity levels [alpha-100, 200, 300, 400].
 */
export interface AlphaNeutralConfig {
  lightIndexOffset: number
  darkIndexOffset: number
  alphaStops: readonly number[]
}
