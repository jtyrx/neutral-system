'use client'

import {NeutralScaleReferenceTable} from '@/components/preview/NeutralScaleReferenceTable'
import {NeutralScaleUsageTable} from '@/components/preview/NeutralScaleUsageTable'
import {SemanticPairGrid} from '@/components/preview/SemanticPairGrid'
import {SemanticSingleThemeGrid} from '@/components/preview/SemanticPairGrid'
import {SemanticRoleTable} from '@/components/preview/SemanticRoleTable'
import {UsedNeutralPrimitivesTable} from '@/components/preview/UsedNeutralPrimitivesTable'
import {usePanelState} from '@/components/preview/pairedRoles/PairedRolesPanelContext'

export function PairedRolesPanelViewRouter() {
  const {
    variant,
    advanced,
    inspectionView,
    displayMode,
    neutralCtx,
    focusTheme,
    focusTitle,
    layerFilter,
    pairEmphasis,
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
  } = usePanelState()
  return (
    <div className="mt-24">
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
          <div className="space-y-24">
            <div className="space-y-8">
              <p className="text-micro font-medium uppercase tracking-wide text-(--chrome-amber-text)">
                Light ramp
              </p>
              <UsedNeutralPrimitivesTable
                global={globalLight}
                usedIndices={usedLightIndices}
                label="Used neutral primitive tokens — Light mapping"
                tier1ExportMode={tier1LightExport}
              />
            </div>
            <div className="space-y-8 border-t border-hairline pt-24">
              <p className="text-micro font-medium uppercase tracking-wide text-(--chrome-sky-text)">
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
        <div className="grid gap-24 nsb-lg:grid-cols-2">
          <div className="space-y-8">
            <p className="text-nano font-medium uppercase tracking-wide text-(--chrome-amber-text)">Light</p>
            <SemanticRoleTable
              tokenView={lightTokenView}
              global={globalLight}
              label="Light primitive token mapping"
              layerFilter={layerFilter}
              tier1ExportMode={tier1LightExport}
            />
          </div>
          <div className="space-y-8">
            <p className="text-nano font-medium uppercase tracking-wide text-(--chrome-sky-text)">
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
        <div className="space-y-8">
          <p className="text-nano font-medium uppercase tracking-wide text-muted">
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
        <div className="space-y-8">
          <p className="text-nano font-medium uppercase tracking-wide text-muted">
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
        <div className="space-y-32">
          <div className="space-y-8">
            <p className="text-micro font-medium uppercase tracking-wide text-(--chrome-amber-text)">
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
          <div className="space-y-8 border-t border-hairline pt-24">
            <p className="text-micro font-medium uppercase tracking-wide text-(--chrome-sky-text)">
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
  )
}
PairedRolesPanelViewRouter.displayName = 'PairedRolesPanelViewRouter'
