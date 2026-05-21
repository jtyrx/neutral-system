import type {TokenSelectTheme} from '@/components/preview/SemanticTokenAnnotation'
import type {GlobalSwatch, TokenView} from '@/lib/neutral-engine'

export type BlockCaseProps = {
  global: GlobalSwatch[]
  tokenView: TokenView
  brandPlaneOklch: string
  /** `light` for the page-surface theme, `darkElevated` for the raised-dark theme. */
  theme: TokenSelectTheme
  inspection?: boolean | undefined
  onSelectSystem?: ((role: string, theme?: TokenSelectTheme) => void) | undefined
}

/**
 * Two runtime values that cannot be CSS custom properties — everything else
 * is inherited from the [data-preview-theme] ancestor scope.
 */
export type NewBlockColors = {
  /** Runtime brand oklch — varies per workbench config, cannot be a CSS variable */
  brand: string
  /** Alpha-mixed scrim — color-mix() computed from alpha config */
  scrimBg: string
}

export type CaseRenderProps = BlockCaseProps & {c: NewBlockColors}
