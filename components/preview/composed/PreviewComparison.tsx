import {GlobalRampCard} from '@/components/preview/GlobalRampCard'
import {PairedRolesPanel} from '@/components/preview/PairedRolesPanel'
import {
  previewChromePanelVariants,
  rampCardAccentClass,
  type PreviewChromeTone,
} from '@/components/preview/previewChrome'
import {PreviewPanelHeading} from '@/components/preview/PreviewPanelHeading'
import type {PairedRoleGroupHints} from '@/components/preview/SemanticPairGrid'
import type {
  GlobalSwatch,
  NeutralArchitectureMode,
  TokenView,
} from '@/lib/neutral-engine'
import {
  INVERT_DARK_RAMP_STRIP,
  previewChromeToneForRampLane,
  rampWorkbenchFocusCaption,
  rampWorkbenchFocusDirection,
  rampWorkbenchFocusEyebrow,
  rampWorkbenchSplitCardTitle,
  rampWorkbenchSplitDarkCaption,
  rampWorkbenchSplitDarkDirection,
  rampWorkbenchSplitLightCaption,
  rampWorkbenchSplitLightDirection,
} from '@/lib/workbench/rampPreviewCopy'

export type ComparisonLayout = 'split' | 'focus'

type Props = {
  layout: ComparisonLayout
  focusTheme: 'light' | 'dark'
  neutralArchitecture: NeutralArchitectureMode
  globalLight: GlobalSwatch[]
  globalDark: GlobalSwatch[]
  lightTokenView: TokenView
  darkTokenView: TokenView
  alphaBaseIndices?: {lightBase: number; darkBase: number} | undefined
}

const GROUP_HINTS: PairedRoleGroupHints = {
  surface:
    'Elevation ladder: sunken → overlay on the ramp; surface.inverse is a dedicated high-contrast flip (grouped separately).',
  text: 'Readable hierarchy: default (primary) down to disabled; text.on is for bold / inverse surfaces.',
  inversePair:
    'Contrast-flip pair: surface.inverse and text.on — ramp mirrors, not normal ladder rungs.',
}

export function PreviewComparison({
  layout,
  focusTheme,
  neutralArchitecture,
  globalLight,
  globalDark,
  lightTokenView,
  darkTokenView,
  alphaBaseIndices,
}: Props) {
  if (layout === 'focus') {
    const isLight = focusTheme === 'light'
    const lane = isLight ? 'light' : 'dark'
    const tokenView = isLight ? lightTokenView : darkTokenView
    const ramp = isLight ? globalLight : globalDark
    const tone: PreviewChromeTone = previewChromeToneForRampLane(lane)
    const title = rampWorkbenchFocusEyebrow(lane)
    const caption = rampWorkbenchFocusCaption(neutralArchitecture, lane)
    const directionHint = rampWorkbenchFocusDirection(neutralArchitecture, lane)

    return (
      <div className="space-y-16">
        <div className={previewChromePanelVariants({tone, layout: 'focus'})}>
          <PreviewPanelHeading
            eyebrow={title}
            title="Mapping preview"
            tone={tone}
            badgeLabel={
              isLight ? 'themeMode: light' : 'themeMode: darkElevated'
            }
          />
          <GlobalRampCard
            id={isLight ? 'light-global-ramp' : 'dark-global-ramp'}
            role="region"
            aria-label={
              isLight ? 'Light neutral ramp' : 'Dark elevated neutral ramp'
            }
            global={ramp}
            tokenView={tokenView}
            caption={caption}
            accentClassName={rampCardAccentClass(tone, 'strong')}
            invertDisplay={!isLight ? INVERT_DARK_RAMP_STRIP : undefined}
            directionHint={directionHint}
            alphaBaseIndex={
              isLight ? alphaBaseIndices?.lightBase : alphaBaseIndices?.darkBase
            }
          />
          <PairedRolesPanel
            variant="focus"
            focusTheme={focusTheme}
            neutralArchitecture={neutralArchitecture}
            globalLight={globalLight}
            globalDark={globalDark}
            lightTokenView={lightTokenView}
            darkTokenView={darkTokenView}
            groupHints={GROUP_HINTS}
          />
        </div>
      </div>
    )
  }

  const simple = neutralArchitecture === 'simple'
  const lightCaption = rampWorkbenchSplitLightCaption(neutralArchitecture)
  const darkCaption = rampWorkbenchSplitDarkCaption(neutralArchitecture)

  return (
    <div className="space-y-32">
      <div className="grid gap-16 nsb-lg:grid-cols-1 nsb-lg:gap-16">
        <div
          className={previewChromePanelVariants({
            tone: 'amber',
            layout: 'splitLight',
          })}
        >
          <PreviewPanelHeading
            eyebrow="Light"
            title={rampWorkbenchSplitCardTitle(neutralArchitecture)}
            tone="amber"
            badgeLabel="themeMode: light"
          />
          <GlobalRampCard
            id="light-global-ramp"
            role="region"
            aria-label={simple ? 'Light global ramp' : 'Light neutral scale'}
            global={globalLight}
            tokenView={lightTokenView}
            caption={lightCaption}
            accentClassName={rampCardAccentClass('amber', 'soft')}
            directionHint={rampWorkbenchSplitLightDirection()}
            alphaBaseIndex={alphaBaseIndices?.lightBase}
          />
        </div>

        <div
          className={previewChromePanelVariants({
            tone: 'sky',
            layout: 'splitDark',
          })}
        >
          <PreviewPanelHeading
            eyebrow="Dark elevated"
            title={rampWorkbenchSplitCardTitle(neutralArchitecture)}
            tone="sky"
            badgeLabel="themeMode: darkElevated"
          />
          <GlobalRampCard
            id="dark-global-ramp"
            role="region"
            aria-label={
              simple ? 'Dark elevated global ramp' : 'Dark neutral scale'
            }
            global={globalDark}
            tokenView={darkTokenView}
            caption={darkCaption}
            accentClassName={rampCardAccentClass('sky', 'soft')}
            invertDisplay={INVERT_DARK_RAMP_STRIP}
            directionHint={rampWorkbenchSplitDarkDirection(neutralArchitecture)}
            alphaBaseIndex={alphaBaseIndices?.darkBase}
          />
        </div>
      </div>

      <PairedRolesPanel
        variant="split"
        neutralArchitecture={neutralArchitecture}
        globalLight={globalLight}
        globalDark={globalDark}
        lightTokenView={lightTokenView}
        darkTokenView={darkTokenView}
        groupHints={GROUP_HINTS}
      />
    </div>
  )
}
PreviewComparison.displayName = 'PreviewComparison'
