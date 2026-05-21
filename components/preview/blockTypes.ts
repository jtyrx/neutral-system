import type {TokenSelectTheme} from '@/components/preview/SemanticTokenAnnotation'
import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'

export type ResolvedBlockColors = {
  page: string
  sunken: string
  subtle: string
  raised: string
  overlay: string
  inverse: string
  brand: string
  td: string
  ts: string
  tm: string
  tdis: string
  ton: string
  bs: string
  bd: string
  bStr: string
  bFocus: string
  scrimBg: string
}

export type BlockCaseProps = {
  global: GlobalSwatch[]
  tokenView: TokenView
  brandPlaneOklch: string
  /** `light` for the page-surface theme, `darkElevated` for the raised-dark theme. */
  theme: TokenSelectTheme
  inspection?: boolean | undefined
  onSelectSystem?: ((role: string, theme?: TokenSelectTheme) => void) | undefined
}

export type CaseRenderProps = BlockCaseProps & {c: ResolvedBlockColors}

/**
 * Narrowed block color props for new blocks authored after Phase 1.
 * Old blocks continue using ResolvedBlockColors during Phase 2 migration.
 */
export type NewBlockColors = {
  /** Runtime brand oklch — varies per workbench config, cannot be a CSS variable */
  brand: string
  /** Alpha-mixed scrim — color-mix() computed from alpha config */
  scrimBg: string
}
