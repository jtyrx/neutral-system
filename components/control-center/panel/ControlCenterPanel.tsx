'use client'

import {Tabs} from '@base-ui/react/tabs'
import {Check, X} from 'lucide-react'
import {
  useCallback,
  useEffect,
  useState,
  type RefObject,
} from 'react'

import {
  ControlCenterPanelContext,
  deriveRampContext,
} from '@/components/control-center/ControlCenterPanelContext'
import {ControlCenterPanelShell} from '@/components/control-center/panel/ControlCenterPanelShell'
import {OklchPanel} from '@/components/control-center/panel/OklchPanel'
import {RampPreviewPanel} from '@/components/control-center/panel/RampPreviewPanel'
import type {RampPreviewMode} from '@/lib/workbench/dockPickerStorage'
import {PrimitiveMappingPanel} from '@/components/control-center/panel/PrimitiveMappingPanel'
import {RoleMappingPanel} from '@/components/control-center/panel/RoleMappingPanel'
import {TunePanel} from '@/components/control-center/panel/TunePanel'
import {CurvePanel} from '@/components/control-center/panel/CurvePanel'
import {
  useDockElevationTuning,
  isPopupHaloEnabled,
} from '@/components/control-center/debug/ControlCenterElevationProvider'
import {useDockReducedMotion} from '@/components/control-center/dock/MagnifyingDockShell'
import {Button} from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuList,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
import {ElevationProgressiveBlur} from '@/components/ui/elevation-progressive-blur.tsx'
import {
  getDockPickerInitialState,
  writeDockPickerUi,
  type DockPickerTabPersisted,
} from '@/lib/workbench/dockPickerStorage'

type ControlCenterTab = DockPickerTabPersisted

const RAMP_PREVIEW_ORDER: RampPreviewMode[] = [
  'follow',
  'light',
  'dark',
  'both',
]

const RAMP_PREVIEW_LABEL: Record<RampPreviewMode, string> = {
  follow: 'Match app',
  light: 'Light ramp',
  dark: 'Dark elevated',
  both: 'Both ramps',
}

const RAMP_PREVIEW_MENU_DESC: Record<RampPreviewMode, string> = {
  follow: 'Uses the neutral ladder that matches your current light or dark UI.',
  light: 'Always show the light global ramp, even when the app is dark.',
  dark: 'Always show the dark elevated ramp, even when the app is light.',
  both: 'Stack light and dark ramps to compare stops side by side.',
}

export type ControlCenterPanelProps = {
  onClose: () => void
  launcherReturnRef?: RefObject<HTMLButtonElement | null>
}

type TabDef = {id: ControlCenterTab; label: string}

const TABS: TabDef[] = [
  {id: 'roleLadder', label: 'Role ladder'},
  {id: 'oklch', label: 'OKLCH'},
  {id: 'tune', label: 'Tune'},
  {id: 'map', label: 'Map'},
  {id: 'curve', label: 'Curve'},
]

const popupWidthClassName =
  'min-h-0 max-h-(--cc-viewport-max-height) w-[min(92vw,62rem)] max-w-[min(92vw,62rem)] [&>*:last-child]:min-h-0 [&>*:last-child]:max-h-(--cc-viewport-max-height)'

const panelSurfaceClassName =
  'flex min-h-0 max-h-(--cc-viewport-max-height) w-full flex-col overflow-hidden rounded-compact-toolbar border border-hairline [--tw-ring-color:color-mix(in_oklch,var(--ring)_20%,transparent)] backdrop-blur-[4px]'

const panelPreviewTierClassName =
  'relative z-1 flex-none overflow-visible rounded-compact-toolbar border border-hairline bg-raised px-12 pt-8 pb-12 shadow-[0_3px_12px_-4px_rgb(0_0_0_/_0.12),0_1px_4px_-2px_rgb(0_0_0_/_0.08)] sm:px-16 sm:pb-16 dark:border-transparent dark:shadow-[0_4px_16px_-6px_rgb(0_0_0_/_0.55),0_2px_8px_-4px_rgb(0_0_0_/_0.35)]'

const rampPreviewTriggerClassName =
  'group flex max-w-[min(16rem,52vw)] flex-row items-center justify-center gap-8 rounded-xl border border-transparent bg-transparent px-12 py-8 text-[0.8125rem] font-light shadow-none transition-[background-color,border-color,box-shadow] duration-150 hover:bg-[color-mix(in_oklch,var(--muted)_40%,transparent)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_color-mix(in_oklch,var(--ring)_45%,transparent)]'

const tabClassName =
  'box-border inline-flex h-[1.625rem] min-h-[1.625rem] flex-none items-center justify-center rounded-full border-0 border-transparent px-12 py-[0.3125rem] text-xs leading-4 font-medium text-muted outline-none transition-[color,background-color,box-shadow] duration-150 hover:bg-[color-mix(in_oklch,var(--muted)_42%,transparent)] hover:text-foreground focus-visible:shadow-[0_0_0_2px_color-mix(in_oklch,var(--ring)_35%,transparent)] data-[active]:bg-raised data-[active]:text-foreground data-[active]:shadow-[0_1px_2px_color-mix(in_oklch,var(--color-text-default)_8%,transparent),inset_0_0_0_1px_color-mix(in_oklch,var(--chrome-hairline)_80%,transparent)] data-[tab-state=active]:bg-raised data-[tab-state=active]:text-foreground data-[tab-state=active]:shadow-[0_1px_2px_color-mix(in_oklch,var(--color-text-default)_8%,transparent),inset_0_0_0_1px_color-mix(in_oklch,var(--chrome-hairline)_80%,transparent)]'

const tabPanelClassName =
  'animate-in fade-in-0 duration-150 ease-out min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-y-contain pt-10 pb-12 [scrollbar-gutter:stable] [scroll-padding-block:0.75rem] sm:pt-12 sm:pb-16 sm:[scroll-padding-block:1rem] motion-reduce:animate-none'

function useControlCenterPanelState() {
  const [persistSeed] = useState(() => getDockPickerInitialState())
  const [activeTab, setActiveTab] = useState<ControlCenterTab>(
    persistSeed.activeTab,
  )
  const [rampPreviewMode, setRampPreviewMode] = useState<RampPreviewMode>(
    persistSeed.rampPreviewMode,
  )

  useEffect(() => {
    writeDockPickerUi({v: 1, rampPreviewMode, activeTab})
  }, [activeTab, rampPreviewMode])

  return {
    activeTab,
    setActiveTab,
    rampPreviewMode,
    setRampPreviewMode,
  }
}

export function ControlCenterPanel({
  onClose,
  launcherReturnRef,
}: ControlCenterPanelProps) {
  const reduceMotionDock = useDockReducedMotion()
  const {
    activeTab,
    setActiveTab,
    rampPreviewMode,
    setRampPreviewMode,
  } = useControlCenterPanelState()
  const {previewTheme} = useNeutralWorkbenchContext()
  const {popupHalo} = useDockElevationTuning()

  const effectiveRampContext = deriveRampContext(rampPreviewMode, previewTheme)

  const handleClose = useCallback(() => {
    onClose()
    queueMicrotask(() => launcherReturnRef?.current?.focus())
  }, [launcherReturnRef, onClose])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleClose])

  return (
    <ControlCenterPanelContext.Provider value={{rampPreviewMode, effectiveRampContext}}>
      {/* `overflow-visible` so overlay-tier `box-shadow` is not clipped; tier z-index paints shadow over controls. */}
      {(() => {
        const shell = (
          <ControlCenterPanelShell
            reduceMotionDock={reduceMotionDock}
            className={panelSurfaceClassName}
          >
            <PanelBody
              activeTab={activeTab}
              rampPreviewMode={rampPreviewMode}
              setRampPreviewMode={setRampPreviewMode}
              setActiveTab={setActiveTab}
              handleClose={handleClose}
            />
          </ControlCenterPanelShell>
        )
        return isPopupHaloEnabled(popupHalo) ? (
          <ElevationProgressiveBlur
            spread={popupHalo.spread}
            layerCount={popupHalo.layerCount}
            maxBlurPx={popupHalo.maxBlurPx}
            curve={popupHalo.curve}
            tension={popupHalo.tension}
            radius="var(--radius-compact-toolbar)"
            bias={popupHalo.bias}
            softness={popupHalo.softness}
            className={popupWidthClassName}
          >
            {shell}
          </ElevationProgressiveBlur>
        ) : (
          <div className={popupWidthClassName}>{shell}</div>
        )
      })()}
    </ControlCenterPanelContext.Provider>
  )
}

type PanelBodyProps = {
  activeTab: ControlCenterTab
  rampPreviewMode: RampPreviewMode
  setRampPreviewMode: (mode: RampPreviewMode) => void
  setActiveTab: (tab: ControlCenterTab) => void
  handleClose: () => void
}

function PanelBody({
  activeTab,
  rampPreviewMode,
  setRampPreviewMode,
  setActiveTab,
  handleClose,
}: PanelBodyProps) {
  return (
    <>
      {/* surface.overlay tier — darker in light theme vs raised; aligns with elevated strip in dark */}
      <section
        aria-label="Ramp preview"
        data-slot="dock-picker-overlay-tier"
        className={panelPreviewTierClassName}
      >
        <div
          className="flex flex-col gap-4"
          data-slot="dock-picker-overlay-inner"
        >
          <div
            className="flex min-w-0 flex-wrap items-center justify-between gap-x-2 gap-y-2 sm:gap-12"
            data-slot="dock-picker-header"
          >
            <h2
              id="dock-picker-title"
              className="min-w-0 shrink text-sm leading-5 text-default sm:text-xs sm:leading-4"
            >
              OKLCH picker
            </h2>
            <div
              className="flex min-w-0 shrink-0 items-center gap-6 sm:gap-8"
              data-slot="dock-picker-header-actions"
            >
              <div data-slot="dock-picker-ramp-preview-wrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button.MenuTrigger
                      aria-label={`Ramp preview: ${RAMP_PREVIEW_LABEL[rampPreviewMode]}`}
                      data-slot="control-center-ramp-preview"
                      label="Ramp preview"
                      value={RAMP_PREVIEW_LABEL[rampPreviewMode]}
                      className={rampPreviewTriggerClassName}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    variant="panel"
                    align="end"
                    sideOffset={10}
                  >
                    <DropdownMenuLabel>
                      Ramp preview
                    </DropdownMenuLabel>
                    <p className="px-12 pb-10 text-caption leading-snug text-muted-foreground">
                      Choose which neutral ladder appears in the strip below.
                    </p>
                    <DropdownMenuSeparator />
                    <DropdownMenuList>
                      {RAMP_PREVIEW_ORDER.map((mode) => {
                        const selected = rampPreviewMode === mode
                        return (
                          <DropdownMenuItem
                            key={mode}
                            onClick={() => setRampPreviewMode(mode)}
                            data-active={selected ? 'true' : undefined}
                          >
                            <div className="flex min-w-0 flex-1 flex-col gap-2">
                              <div className="text-label leading-tight font-medium">
                                {RAMP_PREVIEW_LABEL[mode]}
                              </div>
                              <p className="text-[0.7rem] leading-[1.35] text-muted-foreground">
                                {RAMP_PREVIEW_MENU_DESC[mode]}
                              </p>
                            </div>
                            {selected ? (
                              <Check
                                className="mt-2 size-16 shrink-0 text-primary"
                                aria-hidden
                              />
                            ) : (
                              <span className="size-16 shrink-0" aria-hidden />
                            )}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuList>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-36 shrink-0 rounded-xl"
                aria-label="Close OKLCH picker"
                data-slot="dock-picker-close"
                onClick={handleClose}
              >
                <X className="size-16" aria-hidden />
              </Button>
            </div>
          </div>

          <div data-slot="control-center-ramp-preview-zone">
            <RampPreviewPanel rampPreviewMode={rampPreviewMode} />
          </div>
        </div>
      </section>

      {/* surface.raised tier — controls */}
      <section
        aria-label="Mapping controls"
        data-slot="dock-picker-controls-tier"
        className="relative z-0 flex min-h-0 flex-1 flex-col overflow-hidden rounded-b-compact-toolbar bg-default px-12 pt-8 pb-0 sm:px-16 sm:pt-12"
      >
        <Tabs.Root
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ControlCenterTab)}
          className="contents"
        >
          <Tabs.List
            aria-label="OKLCH picker sections"
            activateOnFocus
            loopFocus
            data-slot="control-center-tablist"
            className="box-border flex h-32 min-h-32 w-max max-w-full min-w-0 flex-none items-center gap-2 overflow-x-auto rounded-full border border-hairline bg-[color-mix(in_oklch,var(--muted)_22%,transparent)] p-2 whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map((tab) => {
              const selected = tab.id === activeTab
              return (
                <Tabs.Tab
                  key={tab.id}
                  value={tab.id}
                  id={`dock-picker-tab-${tab.id}`}
                  data-slot="dock-picker-tab"
                  data-tab-id={tab.id}
                  data-tab-state={selected ? 'active' : 'inactive'}
                  className={tabClassName}
                >
                  {tab.label}
                </Tabs.Tab>
              )
            })}
          </Tabs.List>

          <Tabs.Panel
            value="roleLadder"
            id="dock-picker-tabpanel-roleLadder"
            data-slot="dock-picker-tabpanel"
            data-tab-id="roleLadder"
            className={tabPanelClassName}
          >
            <div data-slot="tabpanel-inner">
              <RoleMappingPanel />
            </div>
          </Tabs.Panel>
          <Tabs.Panel
            value="oklch"
            id="dock-picker-tabpanel-oklch"
            data-slot="dock-picker-tabpanel"
            data-tab-id="oklch"
            className={tabPanelClassName}
          >
            <div data-slot="tabpanel-inner">
              <OklchPanel />
            </div>
          </Tabs.Panel>
          <Tabs.Panel
            value="tune"
            id="dock-picker-tabpanel-tune"
            data-slot="dock-picker-tabpanel"
            data-tab-id="tune"
            className={tabPanelClassName}
          >
            <div data-slot="tabpanel-inner">
              <TunePanel />
            </div>
          </Tabs.Panel>
          <Tabs.Panel
            value="map"
            id="dock-picker-tabpanel-map"
            data-slot="dock-picker-tabpanel"
            data-tab-id="map"
            className={tabPanelClassName}
          >
            <div data-slot="tabpanel-inner">
              <PrimitiveMappingPanel />
            </div>
          </Tabs.Panel>
          <Tabs.Panel
            value="curve"
            id="dock-picker-tabpanel-curve"
            data-slot="dock-picker-tabpanel"
            data-tab-id="curve"
            className={tabPanelClassName}
          >
            <div data-slot="tabpanel-inner">
              <CurvePanel />
            </div>
          </Tabs.Panel>
        </Tabs.Root>
      </section>
    </>
  )

}
