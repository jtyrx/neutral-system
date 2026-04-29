export type Progression = 'linear'

export type ChromaMode = 'achromatic' | 'fixed' | 'taper_mid' | 'taper_ends'

export type LCurve = 'linear' | 'ease-in-dark' | 'ease-out-light' | 's-curve'

export type NamingStyle = 'numeric_desc' | 'semantic' | 'token_ladder'

export type ThemeMode = 'light' | 'darkElevated'

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
  lCurve?: LCurve
  /**
   * Per-end chroma override. When both are set, chroma is interpolated from `chromaLight`
   * (t=0, light end) to `chromaDark` (t=1, dark end), then shaped by `chromaMode`.
   * When either is absent, `baseChroma` is used for both ends (current behaviour).
   */
  chromaLight?: number
  chromaDark?: number
  /**
   * Hue at the light and dark ends (degrees). When both are set and unequal, hue is
   * interpolated via Oklab `range()` so the drift is perceptually smooth. Requires
   * `chromaMode !== 'achromatic'`; ignored otherwise.
   */
  hueLight?: number
  hueDark?: number
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
  | 'text.on'
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
   * When true, exports use `serialized.oklchCss` directly (not `var(--neutral-*)` / legacy `var(--color-neutral-*)` from ramp).
   * Used for `surface.brand` when `brandOklch` parses successfully.
   */
  customColor?: boolean
}

export type PreviewTheme = 'light' | 'dark'

export type WorkbenchSelection =
  | { kind: 'global'; index: number }
  | { kind: 'system'; id: string; theme?: ThemeMode }

/**
 * Configuration for alpha neutral token derivation.
 * Base indices are resolved from `text.default` per theme by default.
 * `lightIndexOffset` / `darkIndexOffset` nudge the base index ±N steps on the ramp.
 * `alphaStops` are the four opacity levels [alpha-100, 200, 300, 400].
 */
export interface AlphaNeutralConfig {
  lightIndexOffset: number
  darkIndexOffset: number
  alphaStops: readonly [number, number, number, number]
}
