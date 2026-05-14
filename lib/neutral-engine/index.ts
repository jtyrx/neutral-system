// Selective named re-exports — explicit listing allows TypeScript and webpack to
// resolve each symbol to its source module without loading the full engine graph.

export type {
  Progression,
  ChromaMode,
  LCurve,
  NamingStyle,
  ThemeMode,
  NeutralArchitectureMode,
  NeutralVariantId,
  GlobalScaleConfig,
  SerializedColor,
  GlobalSwatch,
  ArchitectureRamps,
  KnownSystemRole,
  EmphasisSystemRole,
  OverflowSystemRole,
  SystemRole,
  SystemMappingConfig,
  SystemToken,
  PreviewTheme,
  WorkbenchSelection,
  AlphaNeutralConfig,
} from '@/lib/neutral-engine/types'

export {
  DEFAULT_GLOBAL_SCALE_CONFIG,
  DEFAULT_ADVANCED_LIGHT_SCALE,
  DEFAULT_ADVANCED_DARK_SCALE,
} from '@/lib/neutral-engine/defaultGlobalScaleConfig'

export {type TokenExportChannel, tokensForExportChannel} from '@/lib/neutral-engine/exportTokens'

export {type SemanticIntent, SEMANTIC_INTENT_TO_ROLE} from '@/lib/neutral-engine/semanticPolicy'

export {
  DEFAULT_BRAND_OKLCH,
  tryParseBrandOklch,
  resolveBrandColorForTokens,
  canonicalBrandOklchCss,
} from '@/lib/neutral-engine/brandColor'

export {
  DEFAULT_ALPHA_NEUTRAL_CONFIG,
  deriveAlphaBaseIndex,
  deriveAlphaNeutralCssLines,
  deriveAlphaBaseIndices,
} from '@/lib/neutral-engine/alphaNeutralTokens'

export {buildArchitectureRamps, rampForTheme, rampsEqual} from '@/lib/neutral-engine/architectureRamps'

export {
  applyContrastEmphasisToSystemMapping,
  applyContrastModeToSystemMapping,
} from '@/lib/neutral-engine/effectiveMapping'

export {DEFAULT_SYSTEM_MAPPING, migrateSystemMappingConfig} from '@/lib/neutral-engine/defaultSystemMapping'

export {
  mapLightnessT,
  easeL,
  GLOBAL_SCALE_STEP_MIN,
  GLOBAL_SCALE_STEP_MAX,
  clampGlobalScaleSteps,
  buildGlobalScale,
} from '@/lib/neutral-engine/globalScale'

export {uniqueTokenLadderLabels, labelsForNamingStyle, labelForIndex} from '@/lib/neutral-engine/naming'

export {
  trimCssColorValue,
  serializeColor,
  parseColorFromSerialized,
  oklchCoordsFromSerialized,
} from '@/lib/neutral-engine/serialize'

export {
  contrastVsWhite,
  contrastVsBlack,
  contrastTextOnBg,
  type WcagLevel,
  wcagLargeText,
  wcagUi,
} from '@/lib/neutral-engine/contrast'

export {
  type ContrastPairResult,
  SURFACE_TEXT_CONTRACTS,
  buildContrastPairResults,
} from '@/lib/neutral-engine/contrastContracts'

export {
  clampSystemMappingToLadderLength,
  effectiveStepFromInterval,
  mirrorRampIndex,
  resolveSurfaceInverseIndex,
  resolveTextInverseIndex,
  resolveBorderFocusIndex,
  resolveBrandSurfaceIndex,
  deriveBrandSurfaceToken,
  findIndexForContrast,
  pickLightIndices,
  pickDarkIndices,
  pickDarkStrokeTextIndices,
  resolveLightTextStartIndex,
  fitStandardTextCountForLightLadder,
  resolveDarkTextStartOffset,
  fitStandardTextCountForDarkLadder,
  orderTextIndicesForSemanticRoles,
  deriveSystemTokens,
  previewResolvedRoleIndices,
  deriveAllThemeTokens,
} from '@/lib/neutral-engine/systemMap'

export {
  SURFACE_STANDARD_NAMES,
  SURFACE_STANDARD_SLOT_COUNT,
  SURFACE_STANDARD_COUNT_MIN,
  SURFACE_STANDARD_COUNT_MAX,
  SURFACE_SLOTS,
  BORDER_LADDER_NAMES,
  BORDER_STANDARD_SLOT_COUNT,
  BORDER_SLOTS,
  TEXT_SLOTS,
  TEXT_STANDARD_SLOT_COUNT,
  INVERSE_MODIFIER_INDEX,
  SURFACE_ROLE_SORT_ORDER,
  BORDER_ROLE_SORT_ORDER,
  TEXT_ROLE_SORT_ORDER,
  isInversePairRole,
  isBorderFocusRole,
  type ContrastEmphasis,
  surfaceStandardRoleForIndex,
  surfaceRoleForIndex,
  borderRoleForIndex,
  textRoleForIndex,
  altRoleForIndex,
  emphasisSurfaceRole,
  emphasisBorderRole,
  emphasisTextRole,
  type SemanticCategory,
  semanticCategory,
  compareSemanticRoles,
  isOverflowRole,
} from '@/lib/neutral-engine/semanticNaming'

export {
  type TokenView,
  buildTokenView,
  type SemanticLayer,
  tokensForSemanticLayer,
  tokensForSemanticLayerPublic,
  tokensForSemanticLayerPublicNonInverse,
  tokensForInversePairCategory,
  usedGlobalIndicesFromTokenView,
  usedGlobalIndicesFromTokenViews,
} from '@/lib/neutral-engine/tokenViews'

export {
  type Tier1NeutralExportMode,
  tier1NeutralCssVarName,
  tier1ExportModeFromTheme,
  tier2SemanticCssVarFromRole,
  CHROME_MIXER_LINES,
  linesLiveThemeChromeBlock,
  linesLiveThemeNsChromeBlock,
} from '@/lib/neutral-engine/chromeAliases'

export {
  type DtcgAliasValue,
  type DtcgOklchComponent,
  type DtcgColorValue,
  type DtcgNeutralSystemExtension,
  type DtcgExtensions,
  type DtcgColorToken,
  type DtcgGroup,
  type DtcgTokenTree,
  dtcgColorValueFromSerialized,
  buildDtcgTokenTree,
  validateDtcgTokenTree,
  renderDtcgTokenJson,
  parseDtcgTokenJson,
} from '@/lib/neutral-engine/dtcgTokens'

export {
  tokenCssVarName,
  isPreviewOnlyBrandToken,
  isEmphasisToken,
  semanticColorVarName,
  exportJson,
  exportCssVariables,
  exportCsv,
  exportTailwindV4ThemeInline,
  exportTailwindThemeSnippet,
} from '@/lib/neutral-engine/exportFormats'

export {type VariantPreset, VARIANT_PRESETS, applyVariantToConfig} from '@/lib/neutral-engine/variants'

export {type OkhslView, type OkhslEdit, okhslViewFromConfig, applyOkhslEdit} from '@/lib/neutral-engine/okhsl'

export {
  type OklchPickerTriple,
  type OklchPickerSecondary,
  lightnessAnchorsAroundPickerL,
  pickerToGlobalScale,
  globalScaleToPickerTriple,
  globalScaleToPickerSecondary,
} from '@/lib/neutral-engine/pickerConfig'

export {
  type OklchGamutTarget,
  type MaxInGamutChromaOpts,
  maxInGamutChroma,
  type MultiGamutSample,
  sweepLAtFixedCH,
  sweepLAtFixedCHMulti,
  sweepCAtFixedLH,
  sweepCAtFixedLHMulti,
  sweepHAtFixedLC,
  sweepHAtFixedLCMulti,
  type GamutSliceCell,
  gamutSliceForHue,
  type GamutSliceCellMulti,
  gamutSliceForHueMulti,
  gamutBoundaryPolylineAtHue,
} from '@/lib/neutral-engine/gamutProbing'

export {
  type DisplayGamutTier,
  multiGamutInDisplayTier,
  displayGamutLabel,
  getDisplayGamutSnapshot,
  subscribeDisplayGamut,
} from '@/lib/neutral-engine/displayGamut'
