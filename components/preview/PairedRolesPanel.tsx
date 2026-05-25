'use client'

import {useCallback, useMemo, useState, type Ref} from 'react'

import type {PairedRoleGroupHints} from '@/components/preview/SemanticPairGrid'
import type {SemanticLayerFilter} from '@/components/preview/SemanticRoleTable'
import {
  neutralThemeContext,
  PanelCtx,
  type DisplayMode,
  type InspectionView,
  type PairedRolesPanelVariant,
  type PanelState,
  type RoleScope,
  type ThemeFocus,
} from '@/components/preview/pairedRoles/PairedRolesPanelContext'
import {PairedRolesPanelControls} from '@/components/preview/pairedRoles/PairedRolesPanelControls'
import {PairedRolesPanelHeader} from '@/components/preview/pairedRoles/PairedRolesPanelHeader'
import {PairedRolesPanelViewRouter} from '@/components/preview/pairedRoles/PairedRolesPanelViewRouter'
import {tier1ExportModeFromTheme} from '@/lib/neutral-engine/chromeAliases'
import {usedGlobalIndicesFromTokenView, usedGlobalIndicesFromTokenViews} from '@/lib/neutral-engine/tokenViews'
import type {GlobalSwatch, NeutralArchitectureMode} from '@/lib/neutral-engine/types'
import type {TokenView} from '@/lib/neutral-engine/tokenViews'

export type {PairedRolesPanelVariant}

export type PairedRolesPanelProps = {
  variant: PairedRolesPanelVariant
  neutralArchitecture: NeutralArchitectureMode
  globalLight: GlobalSwatch[]
  globalDark: GlobalSwatch[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  /** Focus layout: active preview theme (drives single-theme chrome). */
  focusTheme?: 'light' | 'dark'
  groupHints?: PairedRoleGroupHints
  ref?: Ref<HTMLDivElement>
}

export function PairedRolesPanel({
  variant,
  neutralArchitecture,
  globalLight,
  globalDark,
  lightTokenView,
  darkTokenView,
  focusTheme = 'light',
  groupHints,
  ref,
}: PairedRolesPanelProps) {
  const advanced = neutralArchitecture === 'advanced'
  const [inspectionView, setInspectionView] = useState<InspectionView>('paired')
  const [themeFocus, setThemeFocus] = useState<ThemeFocus>('both')
  const [roleScope, setRoleScope] = useState<RoleScope>('all')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('table')

  const layerFilter = roleScope as SemanticLayerFilter

  const pairEmphasis = useMemo(() => {
    if (variant === 'focus') return 'both' as const
    return themeFocus
  }, [variant, themeFocus])

  const neutralCtx = useMemo(
    () => neutralThemeContext(variant, themeFocus, focusTheme),
    [variant, themeFocus, focusTheme],
  )

  const usedLightIndices = useMemo(() => usedGlobalIndicesFromTokenView(lightTokenView), [lightTokenView])
  const usedDarkIndices = useMemo(() => usedGlobalIndicesFromTokenView(darkTokenView), [darkTokenView])

  const usedCombinedIndices = useMemo(
    () => usedGlobalIndicesFromTokenViews(lightTokenView, darkTokenView),
    [lightTokenView, darkTokenView],
  )

  const tier1LightExport = useMemo(
    () => (advanced ? tier1ExportModeFromTheme('light') : {architecture: 'simple' as const}),
    [advanced],
  )
  const tier1DarkExport = useMemo(
    () => (advanced ? tier1ExportModeFromTheme('darkElevated') : {architecture: 'simple' as const}),
    [advanced],
  )

  const onInspection = useCallback((v: InspectionView) => setInspectionView(v), [])
  const onThemeFocus = useCallback((v: ThemeFocus) => setThemeFocus(v), [])
  const onRoleScope = useCallback((v: RoleScope) => setRoleScope(v), [])
  const onDisplay = useCallback((v: DisplayMode) => setDisplayMode(v), [])

  const focusTokenView = useMemo(
    () => (focusTheme === 'light' ? lightTokenView : darkTokenView),
    [focusTheme, lightTokenView, darkTokenView],
  )
  const focusTitle = focusTheme === 'light' ? 'Light' : 'Dark elevated'

  const showPrimitiveTiers = inspectionView === 'paired'
  const showThemeTier = variant === 'split' && (inspectionView === 'paired' || inspectionView === 'neutral')

  const shellClass =
    variant === 'split'
      ? 'rounded-sm border border-hairline bg-overlay-soft px-16 py-12 sm:px-20 sm:py-16'
      : 'mt-24 space-y-16 border-t border-hairline pt-24'

  const panelState: PanelState = {
    variant,
    advanced,
    inspectionView,
    themeFocus,
    focusTheme,
    focusTitle,
    roleScope,
    displayMode,
    layerFilter,
    pairEmphasis,
    neutralCtx,
    showThemeTier,
    showPrimitiveTiers,
    globalLight,
    globalDark,
    lightTokenView,
    darkTokenView,
    focusTokenView,
    usedLightIndices,
    usedDarkIndices,
    usedCombinedIndices,
    tier1LightExport,
    tier1DarkExport,
    groupHints,
    onInspection,
    onThemeFocus,
    onRoleScope,
    onDisplay,
  }

  return (
    <PanelCtx.Provider value={panelState}>
      <div ref={ref} className={shellClass}>
        <PairedRolesPanelHeader />
        <PairedRolesPanelControls />
        <PairedRolesPanelViewRouter />
      </div>
    </PanelCtx.Provider>
  )
}
PairedRolesPanel.displayName = 'PairedRolesPanel'
