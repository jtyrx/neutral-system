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
import {UsedNeutralPrimitivesTable} from '@/components/preview/UsedNeutralPrimitivesTable'
import {
  tier1ExportModeFromTheme,
  usedGlobalIndicesFromTokenView,
  usedGlobalIndicesFromTokenViews,
  type GlobalSwatch,
  type NeutralArchitectureMode,
  type TokenView,
} from '@/lib/neutral-engine'

export type PairedRolesPanelVariant = 'split' | 'focus'

type RoleScope = 'all' | 'surface' | 'border' | 'text' | 'interactive' | 'inverse'

type InspectionView = 'paired' | 'neutral'

type ThemeFocus = 'light' | 'dark' | 'both'

type DisplayMode = 'visual' | 'table' | 'usedPrimitives'

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
  {value: 'table', label: 'Data table', shortLabel: 'Table'},
  {value: 'visual', label: 'Visual pairs', shortLabel: 'Visual'},
  {value: 'usedPrimitives', label: 'Used primitives', shortLabel: 'Used'},
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
  neutralArchitecture: NeutralArchitectureMode
  globalLight: GlobalSwatch[]
  globalDark: GlobalSwatch[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  /** Focus layout: active preview theme (drives single-theme chrome). */
  focusTheme?: 'light' | 'dark'
  groupHints?: PairedRoleGroupHints
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
}: PairedRolesPanelProps) {
  const advanced = neutralArchitecture === 'advanced'
  const [inspectionView, setInspectionView] = useState<InspectionView>('paired')
  const [themeFocus, setThemeFocus] = useState<ThemeFocus>('both')
  const [roleScope, setRoleScope] = useState<RoleScope>('all')
  const [displayMode, setDisplayMode] = useState<DisplayMode>('table')

  const layerFilter = useMemo(() => layerFilterFromScope(roleScope), [roleScope])

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

  const tier1LightExport = advanced ? tier1ExportModeFromTheme('light') : {architecture: 'simple' as const}
  const tier1DarkExport = advanced ? tier1ExportModeFromTheme('darkElevated') : {architecture: 'simple' as const}

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
      ? 'rounded-sm border border-hairline bg-[var(--ns-overlay-soft)] px-4 py-3 sm:px-5 sm:py-4'
      : 'mt-6 space-y-4 border-t border-hairline pt-6'

  return (
    <div className={shellClass}>
      <div className="mb-4">
        <p className="eyebrow">Paired roles</p>
        <p className="mt-1 text-sm text-subtle">
          Default: <span className="font-mono text-default">Data table</span> — one row per{' '}
          <span className="font-mono text-subtle">neutral-*</span> primitive (hex, OKLCH, idx) for
          the current layer filter.{' '}
          <span className="font-mono text-default">Used primitives</span> lists every ramp step
          referenced by the mapping (light + dark).{' '}
          <span className="font-mono text-default">Visual pairs</span> shows side-by-side semantic
          cards. Inspection can switch to the full neutral scale.
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
            <p className="mt-2 text-[0.6rem] text-disabled">
              {inspectionView === 'neutral'
                ? 'Frames the neutral ladder with Light (amber) or Dark (sky) preview chrome.'
                : 'Emphasizes Light, Dark, or both columns in paired output.'}
            </p>
          </ControlTier>
        ) : null}

        {variant === 'focus' && inspectionView === 'neutral' ? (
          <ControlTier label="Preview theme">
            <p className="text-xs font-medium text-subtle">
              {focusTheme === 'light'
                ? 'Light (amber) — matches toolbar preview'
                : 'Dark elevated (sky) — matches toolbar preview'}
            </p>
          </ControlTier>
        ) : null}

        {showPrimitiveTiers && variant === 'focus' ? (
          <ControlTier label="Preview theme">
            <p className="text-xs font-medium text-subtle">
              {focusTheme === 'light'
                ? 'Light — matches toolbar preview (amber chrome below)'
                : 'Dark elevated — matches toolbar preview (sky chrome below)'}
            </p>
          </ControlTier>
        ) : null}

        {showPrimitiveTiers ? (
          <div className="grid gap-4 nsb-lg:grid-cols-1 nsb-lg:items-end">
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
            globalLight={globalLight}
            globalDark={globalDark}
            groupHints={groupHints}
            pairEmphasis={pairEmphasis}
          />
        ) : null}

        {inspectionView === 'paired' && variant === 'split' && displayMode === 'usedPrimitives' ? (
          advanced ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <p className="text-[0.65rem] font-medium uppercase tracking-wide text-(--chrome-amber-text)">
                  Light ramp
                </p>
                <UsedNeutralPrimitivesTable
                  global={globalLight}
                  usedIndices={usedLightIndices}
                  label="Used neutral primitive tokens — Light mapping"
                  tier1ExportMode={tier1LightExport}
                />
              </div>
              <div className="space-y-2 border-t border-hairline pt-6">
                <p className="text-[0.65rem] font-medium uppercase tracking-wide text-(--chrome-sky-text)">
                  Dark elevated ramp
                </p>
                <UsedNeutralPrimitivesTable
                  global={globalDark}
                  usedIndices={usedDarkIndices}
                  label="Used neutral primitive tokens — Dark elevated mapping"
                  tier1ExportMode={tier1DarkExport}
                />
              </div>
            </div>
          ) : (
            <UsedNeutralPrimitivesTable
              global={globalLight}
              usedIndices={usedCombinedIndices}
              label="Used neutral primitive tokens (light and dark mapping)"
            />
          )
        ) : null}

        {inspectionView === 'paired' && variant === 'split' && displayMode === 'table' ? (
          <div className="grid gap-6 nsb-lg:grid-cols-2">
            <div className="space-y-2">
              <p className="text-[0.6rem] font-medium uppercase tracking-wide text-(--chrome-amber-text)">Light</p>
              <SemanticRoleTable
                tokenView={lightTokenView}
                global={globalLight}
                label="Light primitive token mapping"
                layerFilter={layerFilter}
                tier1ExportMode={tier1LightExport}
              />
            </div>
            <div className="space-y-2">
              <p className="text-[0.6rem] font-medium uppercase tracking-wide text-(--chrome-sky-text)">
                Dark elevated
              </p>
              <SemanticRoleTable
                tokenView={darkTokenView}
                global={globalDark}
                label="Dark elevated primitive token mapping"
                layerFilter={layerFilter}
                tier1ExportMode={tier1DarkExport}
              />
            </div>
          </div>
        ) : null}

        {inspectionView === 'paired' && variant === 'focus' && displayMode === 'visual' ? (
          <SemanticSingleThemeGrid
            tokenView={focusTokenView}
            global={focusTheme === 'light' ? globalLight : globalDark}
            groupHints={groupHints}
            themeChrome={focusTheme}
          />
        ) : null}

        {inspectionView === 'paired' && variant === 'focus' && displayMode === 'table' ? (
          <div className="space-y-2">
            <p className="text-[0.6rem] font-medium uppercase tracking-wide text-muted">
              {focusTitle} · data table
            </p>
            <SemanticRoleTable
              tokenView={focusTokenView}
              global={focusTheme === 'light' ? globalLight : globalDark}
              label={`${focusTitle} primitive token mapping`}
              layerFilter={layerFilter}
              tier1ExportMode={focusTheme === 'light' ? tier1LightExport : tier1DarkExport}
            />
          </div>
        ) : null}

        {inspectionView === 'paired' && variant === 'focus' && displayMode === 'usedPrimitives' ? (
          <div className="space-y-2">
            <p className="text-[0.6rem] font-medium uppercase tracking-wide text-muted">
              Used neutral primitives
            </p>
            <UsedNeutralPrimitivesTable
              global={focusTheme === 'light' ? globalLight : globalDark}
              usedIndices={focusTheme === 'light' ? usedLightIndices : usedDarkIndices}
              label={`Used neutral primitive tokens — ${focusTitle} mapping`}
              tier1ExportMode={focusTheme === 'light' ? tier1LightExport : tier1DarkExport}
            />
          </div>
        ) : null}

        {inspectionView === 'neutral' && advanced && neutralCtx === 'both' ? (
          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-[0.65rem] font-medium uppercase tracking-wide text-(--chrome-amber-text)">
                Light ramp
              </p>
              <NeutralScaleReferenceTable
                global={globalLight}
                tier1ExportMode={tier1LightExport}
                themeContext="light"
                embedded
              />
              <NeutralScaleUsageTable
                global={globalLight}
                usedIndices={usedLightIndices}
                tier1ExportMode={tier1LightExport}
                themeContext="light"
                embedded
              />
            </div>
            <div className="space-y-2 border-t border-hairline pt-6">
              <p className="text-[0.65rem] font-medium uppercase tracking-wide text-(--chrome-sky-text)">
                Dark elevated ramp
              </p>
              <NeutralScaleReferenceTable
                global={globalDark}
                tier1ExportMode={tier1DarkExport}
                themeContext="dark"
                embedded
              />
              <NeutralScaleUsageTable
                global={globalDark}
                usedIndices={usedDarkIndices}
                tier1ExportMode={tier1DarkExport}
                themeContext="dark"
                embedded
              />
            </div>
          </div>
        ) : null}

        {inspectionView === 'neutral' && !(advanced && neutralCtx === 'both') ? (
          <>
            <NeutralScaleReferenceTable
              global={advanced && neutralCtx === 'dark' ? globalDark : globalLight}
              tier1ExportMode={
                !advanced ? {architecture: 'simple'} : neutralCtx === 'dark' ? tier1DarkExport : tier1LightExport
              }
              themeContext={neutralCtx}
              embedded
            />
            <NeutralScaleUsageTable
              global={advanced && neutralCtx === 'dark' ? globalDark : globalLight}
              usedIndices={
                neutralCtx === 'both' ? usedCombinedIndices : neutralCtx === 'dark' ? usedDarkIndices : usedLightIndices
              }
              tier1ExportMode={
                !advanced ? {architecture: 'simple'} : neutralCtx === 'dark' ? tier1DarkExport : tier1LightExport
              }
              themeContext={neutralCtx}
              embedded
            />
          </>
        ) : null}
      </div>
    </div>
  )
}
