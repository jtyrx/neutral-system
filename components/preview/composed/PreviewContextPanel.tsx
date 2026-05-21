
import {PreviewComparison, type ComparisonLayout} from '@/components/preview/composed/PreviewComparison'
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
  alphaBaseIndices?: {lightBase: number; darkBase: number} | undefined
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

  const lightIdx = previewResolvedRoleIndices(derivationConfigLight, nl, 'light')
  const darkIdx = previewResolvedRoleIndices(derivationConfigDark, nd, 'darkElevated')

  return (
    <div
      className="border-b border-hairline bg-sunken backdrop-blur-xl supports-backdrop-filter:bg-sunken"
      role="region"
      aria-label="Preview context — Light versus Dark Elevated comparison"
    >
      <div>
        <header className="border-b border-hairline px-16 py-16 sm:px-24">
          <div className="flex flex-col gap-16 nsb-lg:flex-row nsb-lg:items-start nsb-lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="eyebrow">Compare themes</p>
              <h2 className="mt-2 text-base font-semibold tracking-tight text-default sm:text-lg">
                Light vs Dark elevated
              </h2>
              <p className="mt-4 max-w-2xl text-xs text-muted">
                Ramps and paired roles use the same mapping as exports. Split = both themes; Focus =
                one at a time. Contrast emphasis changes ladder spacing (see below).
              </p>
              <div className="mt-16 max-w-full" id="offset-mapping-diagrams">
                <div className="grid gap-16 nsb-lg:grid-cols-1">
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

        <div className="px-16 py-20 sm:px-24 sm:py-24">
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
PreviewContextPanel.displayName = 'PreviewContextPanel'
