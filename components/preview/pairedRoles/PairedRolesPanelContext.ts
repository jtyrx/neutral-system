'use client'

import {createContext, useContext} from 'react'

import type {NeutralTableThemeContext} from '@/components/preview/NeutralScaleReferenceTable'
import type {SegmentedOption} from '@/components/preview/SegmentedControl'
import type {PairedRoleGroupHints} from '@/components/preview/SemanticPairGrid'
import type {SemanticLayerFilter} from '@/components/preview/SemanticRoleTable'
import type {Tier1NeutralExportMode} from '@/lib/neutral-engine/chromeAliases'
import type {GlobalSwatch} from '@/lib/neutral-engine/types'
import type {TokenView} from '@/lib/neutral-engine/tokenViews'

export type PairedRolesPanelVariant = 'split' | 'focus'

export type RoleScope = 'all' | 'surface' | 'border' | 'text' | 'interactive' | 'inverse' | 'brand'

export type InspectionView = 'paired' | 'neutral'

export type ThemeFocus = 'light' | 'dark' | 'both'

export type DisplayMode = 'visual' | 'table' | 'usedPrimitives'

type PanelConfig = {
  inspectionOptions: readonly SegmentedOption<InspectionView>[]
  themeFocusOptions: readonly SegmentedOption<ThemeFocus>[]
  roleScopeOptions: readonly SegmentedOption<RoleScope>[]
  displayOptions: readonly SegmentedOption<DisplayMode>[]
  themeFocusHint: {neutral: string; paired: string}
}

export type PanelState = {
  variant: PairedRolesPanelVariant
  advanced: boolean
  inspectionView: InspectionView
  themeFocus: ThemeFocus
  focusTheme: 'light' | 'dark'
  focusTitle: string
  roleScope: RoleScope
  displayMode: DisplayMode
  layerFilter: SemanticLayerFilter
  pairEmphasis: ThemeFocus
  neutralCtx: NeutralTableThemeContext
  showThemeTier: boolean
  showPrimitiveTiers: boolean
  globalLight: GlobalSwatch[]
  globalDark: GlobalSwatch[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  focusTokenView: TokenView
  usedLightIndices: ReadonlySet<number>
  usedDarkIndices: ReadonlySet<number>
  usedCombinedIndices: ReadonlySet<number>
  tier1LightExport: Tier1NeutralExportMode
  tier1DarkExport: Tier1NeutralExportMode
  groupHints?: PairedRoleGroupHints | undefined
  onInspection: (v: InspectionView) => void
  onThemeFocus: (v: ThemeFocus) => void
  onRoleScope: (v: RoleScope) => void
  onDisplay: (v: DisplayMode) => void
}

export const PanelCtx = createContext<PanelState | null>(null)

export function usePanelState(): PanelState {
  const ctx = useContext(PanelCtx)
  if (!ctx) throw new Error('PanelCtx missing provider')
  return ctx
}

export const PANEL_CONFIG = {
  inspectionOptions: [
    {value: 'paired', label: 'Paired roles', shortLabel: 'Paired'},
    {value: 'neutral', label: 'Neutral scale', shortLabel: 'Neutral'},
  ],
  themeFocusOptions: [
    {value: 'light', label: 'Light'},
    {value: 'dark', label: 'Dark elevated', shortLabel: 'Dark'},
    {value: 'both', label: 'Both themes', shortLabel: 'Both'},
  ],
  roleScopeOptions: [
    {value: 'all', label: 'All layers', shortLabel: 'All'},
    {value: 'surface', label: 'Surface'},
    {value: 'border', label: 'Border'},
    {value: 'text', label: 'Content'},
    {value: 'inverse', label: 'Inverse'},
    {value: 'brand', label: 'Brand'},
    {value: 'interactive', label: 'State & overlay', shortLabel: 'State'},
  ],
  displayOptions: [
    {value: 'table', label: 'Data table', shortLabel: 'Table'},
    {value: 'visual', label: 'Visual pairs', shortLabel: 'Visual'},
    {value: 'usedPrimitives', label: 'Used primitives', shortLabel: 'Used'},
  ],
  themeFocusHint: {
    neutral: 'Frames the neutral ladder with Light (amber) or Dark (sky) preview chrome.',
    paired: 'Emphasizes Light, Dark, or both columns in paired output.',
  },
} satisfies PanelConfig

export function neutralThemeContext(
  variant: PairedRolesPanelVariant,
  themeFocus: ThemeFocus,
  focusTheme: 'light' | 'dark' | undefined,
): NeutralTableThemeContext {
  if (variant === 'focus') {
    return focusTheme === 'dark' ? 'dark' : 'light'
  }
  if (themeFocus === 'both') return 'both'
  return themeFocus === 'light' ? 'light' : 'dark'
}
