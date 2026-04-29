'use client'

import {useMemo} from 'react'

import {PreviewComparison, type ComparisonLayout} from '@/components/preview/PreviewComparison'
import {OffsetMapDiagram} from '@/components/viz/OffsetMapDiagram'
import {previewResolvedRoleIndices} from '@/lib/neutral-engine/systemMap'
import type {
  GlobalSwatch,
  NeutralArchitectureMode,
  SystemMappingConfig,
  TokenView,
} from '@/lib/neutral-engine'

type Props = {
  neutralArchitecture: NeutralArchitectureMode
  globalLight: GlobalSwatch[]
  globalDark: GlobalSwatch[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  previewTheme: 'light' | 'dark'
  comparisonLayout: ComparisonLayout
  derivationConfigLight: SystemMappingConfig
  derivationConfigDark: SystemMappingConfig
  ladderLightSteps: number
  ladderDarkSteps: number
  alphaBaseIndices?: {lightBase: number; darkBase: number}
}

/**
 * Light vs Dark comparison — scrolls with page (not sticky).
 */
export function PreviewContextPanel({
  neutralArchitecture,
  globalLight,
  globalDark,
  lightTokenView,
  darkTokenView,
  previewTheme,
  comparisonLayout,
  derivationConfigLight,
  derivationConfigDark,
  ladderLightSteps,
  ladderDarkSteps,
  alphaBaseIndices,
}: Props) {
  const nl = Math.max(2, ladderLightSteps)
  const nd = Math.max(2, ladderDarkSteps)

  const lightIdx = useMemo(
    () => previewResolvedRoleIndices(derivationConfigLight, nl, 'light'),
    [derivationConfigLight, nl],
  )
  const darkIdx = useMemo(
    () => previewResolvedRoleIndices(derivationConfigDark, nd, 'darkElevated'),
    [derivationConfigDark, nd],
  )

  return (
    <div
      className="border-b border-hairline bg-(--ns-app-bg) backdrop-blur-xl supports-backdrop-filter:bg-(--ns-app-bg)"
      role="region"
      aria-label="Preview context — Light versus Dark Elevated comparison"
    >
      <div>
        <header className="border-b border-hairline px-4 py-4 sm:px-6">
          <div className="flex flex-col gap-4 nsb-lg:flex-row nsb-lg:items-start nsb-lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="eyebrow">Compare themes</p>
              <h2 className="mt-0.5 text-base font-semibold tracking-tight text-default sm:text-lg">
                Light vs Dark elevated
              </h2>
              <p className="mt-1 max-w-2xl text-xs text-muted">
                Ramps and paired roles use the same mapping as exports. Split = both themes; Focus =
                one at a time. Contrast emphasis changes ladder spacing (see below).
              </p>
              <div className="mt-4 max-w-full" id="offset-mapping-diagrams">
                <div className="grid gap-4 nsb-lg:grid-cols-1">
                  <OffsetMapDiagram
                    steps={ladderLightSteps}
                    themeLabel="Light"
                    description="Bars use the same resolved global indices as light themeMode tokens (low index = light)."
                    surfaceIndices={lightIdx.surface}
                    borderIndices={lightIdx.border}
                    textIndices={lightIdx.text}
                    alphaBaseIndex={alphaBaseIndices?.lightBase}
                  />
                  <OffsetMapDiagram
                    steps={ladderDarkSteps}
                    themeLabel="Dark elevated"
                    description="Bars use the same resolved global indices as darkElevated themeMode tokens (tail-anchored picks)."
                    surfaceIndices={darkIdx.surface}
                    borderIndices={darkIdx.border}
                    textIndices={darkIdx.text}
                    alphaBaseIndex={alphaBaseIndices?.darkBase}
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <PreviewComparison
            layout={comparisonLayout}
            focusTheme={previewTheme}
            neutralArchitecture={neutralArchitecture}
            globalLight={globalLight}
            globalDark={globalDark}
            lightTokenView={lightTokenView}
            darkTokenView={darkTokenView}
            alphaBaseIndices={alphaBaseIndices}
          />
        </div>
      </div>
    </div>
  )
}
