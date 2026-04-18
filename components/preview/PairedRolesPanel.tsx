'use client'

import {useCallback, useMemo, useState} from 'react'

import {NeutralScaleReferenceTable} from '@/components/preview/NeutralScaleReferenceTable'
import type {NeutralTableThemeContext} from '@/components/preview/NeutralScaleReferenceTable'
import {NeutralScaleUsageTable} from '@/components/preview/NeutralScaleUsageTable'
import {ControlTier, SegmentedControl, type SegmentedOption} from '@/components/preview/SegmentedControl'
import {
  type PairedRoleGroupHints,
  SemanticPairGrid,
  SemanticSingleThemeGrid,
} from '@/components/preview/SemanticPairGrid'
import {SemanticRoleTable, type SemanticLayerFilter} from '@/components/preview/SemanticRoleTable'
import {usedGlobalIndicesFromTokenViews, type GlobalSwatch, type TokenView} from '@/lib/neutral-engine'

export type PairedRolesPanelVariant = 'split' | 'focus'

type RoleScope = 'all' | 'surface' | 'border' | 'text' | 'interactive' | 'inverse'

type InspectionView = 'paired' | 'neutral'

type ThemeFocus = 'light' | 'dark' | 'both'

type DisplayMode = 'visual' | 'table'

const INSPECTION_OPTIONS: SegmentedOption<InspectionView>[] = [
  {value: 'paired', label: 'Paired roles', shortLabel: 'Paired'},
  {value: 'neutral', label: 'Neutral scale', shortLabel: 'Neutral'},
]

const THEME_FOCUS_OPTIONS: SegmentedOption<ThemeFocus>[] = [
  {value: 'light', label: 'Light'},
  {value: 'dark', label: 'Dark elevated', shortLabel: 'Dark'},
  {value: 'both', label: 'Both themes', shortLabel: 'Both'},
]

const ROLE_SCOPE_OPTIONS: SegmentedOption<RoleScope>[] = [
  {value: 'all', label: 'All layers', shortLabel: 'All'},
  {value: 'surface', label: 'Surface', shortLabel: 'Surface'},
  {value: 'border', label: 'Border', shortLabel: 'Border'},
  {value: 'text', label: 'Content', shortLabel: 'Content'},
  {value: 'inverse', label: 'Inverse', shortLabel: 'Inverse'},
  {value: 'interactive', label: 'State & overlay', shortLabel: 'State'},
]

const DISPLAY_OPTIONS: SegmentedOption<DisplayMode>[] = [
  {value: 'visual', label: 'Visual pairs', shortLabel: 'Visual'},
  {value: 'table', label: 'Data table', shortLabel: 'Table'},
]

function layerFilterFromScope(scope: RoleScope): SemanticLayerFilter {
  return scope
}

function neutralThemeContext(
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

export type PairedRolesPanelProps = {
  variant: PairedRolesPanelVariant
  global: GlobalSwatch[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  /** Focus layout: active preview theme (drives single-theme chrome). */
  focusTheme?: 'light' | 'dark'
  groupHints?: PairedRoleGroupHints
}

export function PairedRolesPanel({
  variant,
  global,
  lightTokenView,
  darkTokenView,
  focusTheme = 'light',
  groupHints,
}: PairedRolesPanelProps) {
  const [inspectionView, setInspectionView] = useState<InspectionView>('paired')
  const [themeFocus, setThemeFocus] = useState<ThemeFocus>('both')
  const [roleScope, setRoleScope] = useState<RoleScope>('all')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('visual')

  const layerFilter = useMemo(() => layerFilterFromScope(roleScope), [roleScope])

  const pairEmphasis = useMemo(() => {
    if (variant === 'focus') return 'both' as const
    return themeFocus
  }, [variant, themeFocus])

  const neutralCtx = useMemo(
    () => neutralThemeContext(variant, themeFocus, focusTheme),
    [variant, themeFocus, focusTheme],
  )

  const usedGlobalIndices = useMemo(
    () => usedGlobalIndicesFromTokenViews(lightTokenView, darkTokenView),
    [lightTokenView, darkTokenView],
  )

  const onInspection = useCallback((v: InspectionView) => setInspectionView(v), [])
  const onThemeFocus = useCallback((v: ThemeFocus) => setThemeFocus(v), [])
  const onRoleScope = useCallback((v: RoleScope) => setRoleScope(v), [])
  const onDisplay = useCallback((v: DisplayMode) => setDisplayMode(v), [])

  const focusTokenView = focusTheme === 'light' ? lightTokenView : darkTokenView
  const focusTitle = focusTheme === 'light' ? 'Light' : 'Dark elevated'

  const showPrimitiveTiers = inspectionView === 'paired'
  const showThemeTier = variant === 'split' && (inspectionView === 'paired' || inspectionView === 'neutral')

  const shellClass =
    variant === 'split'
      ? 'rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5'
      : 'mt-6 space-y-4 border-t border-white/10 pt-6'

  return (
    <div className={shellClass}>
      <div className="mb-4">
        <p className="eyebrow">Paired roles</p>
        <p className="mt-1 text-sm text-white/70">
          Same semantic role across themes (e.g. surface.base). Use inspection to switch to the
          full neutral ladder.
        </p>
      </div>

      <div className="space-y-4">
        <ControlTier label="Inspection">
          <SegmentedControl
            aria-label="Inspection view"
            value={inspectionView}
            options={INSPECTION_OPTIONS}
            onChange={onInspection}
          />
        </ControlTier>

        {showThemeTier ? (
          <ControlTier label="Theme context">
            <SegmentedControl
              aria-label="Theme context for primitive inspection"
              value={themeFocus}
              options={THEME_FOCUS_OPTIONS}
              onChange={onThemeFocus}
            />
            <p className="mt-2 text-[0.6rem] text-white/35">
              {inspectionView === 'neutral'
                ? 'Frames the neutral ladder with Light (amber) or Dark (sky) preview chrome.'
                : 'Emphasizes Light, Dark, or both columns in paired output.'}
            </p>
          </ControlTier>
        ) : null}

        {variant === 'focus' && inspectionView === 'neutral' ? (
          <ControlTier label="Preview theme">
            <p className="text-xs font-medium text-white/75">
              {focusTheme === 'light'
                ? 'Light (amber) — matches toolbar preview'
                : 'Dark elevated (sky) — matches toolbar preview'}
            </p>
          </ControlTier>
        ) : null}

        {showPrimitiveTiers && variant === 'focus' ? (
          <ControlTier label="Preview theme">
            <p className="text-xs font-medium text-white/75">
              {focusTheme === 'light'
                ? 'Light — matches toolbar preview (amber chrome below)'
                : 'Dark elevated — matches toolbar preview (sky chrome below)'}
            </p>
          </ControlTier>
        ) : null}

        {showPrimitiveTiers ? (
          <div className="grid gap-4 lg:grid-cols-1 lg:items-end">
            <ControlTier label="Semantic layer">
              <SegmentedControl
                aria-label="Semantic token layer"
                value={roleScope}
                options={ROLE_SCOPE_OPTIONS}
                onChange={onRoleScope}
              />
            </ControlTier>
            <ControlTier label="Display">
              <SegmentedControl
                aria-label="Paired roles display mode"
                value={displayMode}
                options={DISPLAY_OPTIONS}
                onChange={onDisplay}
              />
            </ControlTier>
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        {inspectionView === 'paired' && variant === 'split' && displayMode === 'visual' ? (
          <SemanticPairGrid
            lightTokenView={lightTokenView}
            darkTokenView={darkTokenView}
            global={global}
            groupHints={groupHints}
            pairEmphasis={pairEmphasis}
          />
        ) : null}

        {inspectionView === 'paired' && variant === 'split' && displayMode === 'table' ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[0.6rem] font-medium uppercase tracking-wide text-amber-200/80">Light</p>
              <SemanticRoleTable
                tokenView={lightTokenView}
                global={global}
                label="Light semantic role mapping"
                layerFilter={layerFilter}
              />
            </div>
            <div className="space-y-2">
              <p className="text-[0.6rem] font-medium uppercase tracking-wide text-sky-200/80">
                Dark elevated
              </p>
              <SemanticRoleTable
                tokenView={darkTokenView}
                global={global}
                label="Dark elevated semantic role mapping"
                layerFilter={layerFilter}
              />
            </div>
          </div>
        ) : null}

        {inspectionView === 'paired' && variant === 'focus' && displayMode === 'visual' ? (
          <SemanticSingleThemeGrid
            tokenView={focusTokenView}
            global={global}
            groupHints={groupHints}
            themeChrome={focusTheme}
          />
        ) : null}

        {inspectionView === 'paired' && variant === 'focus' && displayMode === 'table' ? (
          <div className="space-y-2">
            <p className="text-[0.6rem] font-medium uppercase tracking-wide text-white/45">
              {focusTitle} · data table
            </p>
            <SemanticRoleTable
              tokenView={focusTokenView}
              global={global}
              label={`${focusTitle} semantic role mapping`}
              layerFilter={layerFilter}
            />
          </div>
        ) : null}

        {inspectionView === 'neutral' ? (
          <>
            <NeutralScaleReferenceTable global={global} themeContext={neutralCtx} embedded />
            <NeutralScaleUsageTable
              global={global}
              usedIndices={usedGlobalIndices}
              themeContext={neutralCtx}
              embedded
            />
          </>
        ) : null}
      </div>
    </div>
  )
}
