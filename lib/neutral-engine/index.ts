// Type-only barrel — import runtime values directly from their source modules.
// Re-exporting runtime values from a folder barrel causes Next.js App Router to
// load the full engine graph on every consumer; direct imports keep bundles lean.

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

export type {TokenExportChannel} from '@/lib/neutral-engine/exportTokens'

export type {SemanticIntent} from '@/lib/neutral-engine/semanticPolicy'

export type {
  ContrastPairResult,
} from '@/lib/neutral-engine/contrastContracts'

export type {WcagLevel} from '@/lib/neutral-engine/contrast'

export type {ContrastEmphasis, SemanticCategory} from '@/lib/neutral-engine/semanticNaming'

export type {
  TokenView,
  SemanticLayer,
} from '@/lib/neutral-engine/tokenViews'

export type {
  Tier1NeutralExportMode,
} from '@/lib/neutral-engine/chromeAliases'

export type {
  DtcgAliasValue,
  DtcgOklchComponent,
  DtcgColorValue,
  DtcgNeutralSystemExtension,
  DtcgExtensions,
  DtcgColorToken,
  DtcgGroup,
  DtcgTokenTree,
} from '@/lib/neutral-engine/dtcgTokens'

export type {VariantPreset} from '@/lib/neutral-engine/variants'

export type {OkhslView, OkhslEdit} from '@/lib/neutral-engine/okhsl'

export type {
  OklchPickerTriple,
  OklchPickerSecondary,
} from '@/lib/neutral-engine/pickerConfig'

export type {
  OklchGamutTarget,
  MaxInGamutChromaOpts,
  MultiGamutSample,
  GamutSliceCell,
  GamutSliceCellMulti,
} from '@/lib/neutral-engine/gamutProbing'

export type {DisplayGamutTier} from '@/lib/neutral-engine/displayGamut'
