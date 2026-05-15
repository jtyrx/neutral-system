'use client'

import {Tabs} from '@base-ui/react/tabs'
import {Check, ChevronDown, X} from 'lucide-react'
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
import {RoleMappingPanel} from '@/components/control-center/panel/RoleMappingPanel'
import {TunePanel} from '@/components/control-center/panel/TunePanel'
import {
  useDockElevationTuning,
  isPopupHaloEnabled,
} from '@/components/control-center/debug/ControlCenterElevationProvider'
import {useDockReducedMotion} from '@/components/control-center/dock/MagnifyingDockShell'
import {Button} from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuList,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {useNeutralWorkbenchContext} from '@/components/providers/NeutralWorkbenchProvider'
import {ElevationProgressiveBlur} from '@/components/ui/elevation-progressive-blur'
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
]

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
      {isPopupHaloEnabled(popupHalo) ? (
        <ElevationProgressiveBlur
          spread={popupHalo.spread}
          layerCount={popupHalo.layerCount}
          maxBlurPx={popupHalo.maxBlurPx}
          curve={popupHalo.curve}
          tension={popupHalo.tension}
          radius="var(--radius-compact-toolbar)"
          bias={popupHalo.bias}
          softness={popupHalo.softness}
          className="cc-popup-width"
        >
          <ControlCenterPanelShell reduceMotionDock={reduceMotionDock} className="cc-panel-surface">
            <PanelBody
              activeTab={activeTab}
              rampPreviewMode={rampPreviewMode}
              setRampPreviewMode={setRampPreviewMode}
              setActiveTab={setActiveTab}
              handleClose={handleClose}
            />
          </ControlCenterPanelShell>
        </ElevationProgressiveBlur>
      ) : (
        <div className="cc-popup-width">
          <ControlCenterPanelShell reduceMotionDock={reduceMotionDock} className="cc-panel-surface">
            <PanelBody
              activeTab={activeTab}
              rampPreviewMode={rampPreviewMode}
              setRampPreviewMode={setRampPreviewMode}
              setActiveTab={setActiveTab}
              handleClose={handleClose}
            />
          </ControlCenterPanelShell>
        </div>
      )}
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
        className="cc-panel-tier-preview"
      >
        <div
          className="cc-panel-overlay-inner"
          data-slot="dock-picker-overlay-inner"
        >
          <div
            className="cc-panel-header"
            data-slot="dock-picker-header"
          >
            <h2
              id="dock-picker-title"
              className="cc-panel-title"
            >
              OKLCH picker
            </h2>
            <div
              className="cc-panel-actions"
              data-slot="dock-picker-header-actions"
            >
              <div data-slot="dock-picker-ramp-preview-wrap">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Ramp preview: ${RAMP_PREVIEW_LABEL[rampPreviewMode]}`}
                      data-slot="control-center-ramp-preview"
                      className="group cc-ramp-preview-trigger"
                    >
                      <span className="cc-ramp-preview-trigger-label">
                        Ramp preview
                      </span>
                      <span className="cc-ramp-preview-trigger-value">
                        <span className="cc-ramp-preview-trigger-text">
                          {RAMP_PREVIEW_LABEL[rampPreviewMode]}
                        </span>
                        <ChevronDown
                          className="size-3.5 shrink-0 text-muted-foreground opacity-95"
                          aria-hidden
                        />
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    variant="panel"
                    align="end"
                    sideOffset={10}
                  >
                    <DropdownMenuLabel>
                      Ramp preview
                    </DropdownMenuLabel>
                    <p className="cc-ramp-preview-menu-desc">
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
                            <div className="cc-ramp-preview-menu-item-body">
                              <div className="cc-ramp-preview-menu-item-title">
                                {RAMP_PREVIEW_LABEL[mode]}
                              </div>
                              <p className="cc-ramp-preview-menu-item-desc">
                                {RAMP_PREVIEW_MENU_DESC[mode]}
                              </p>
                            </div>
                            {selected ? (
                              <Check
                                className="mt-0.5 size-4 shrink-0 text-primary"
                                aria-hidden
                              />
                            ) : (
                              <span className="size-4 shrink-0" aria-hidden />
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
                className="size-9 shrink-0 rounded-xl"
                aria-label="Close OKLCH picker"
                data-slot="dock-picker-close"
                onClick={handleClose}
              >
                <X className="size-4" aria-hidden />
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
        className="cc-panel-tier-controls"
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
            className="cc-tablist"
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
                  className="cc-tab"
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
            className="cc-tabpanel"
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
            className="cc-tabpanel"
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
            className="cc-tabpanel"
          >
            <div data-slot="tabpanel-inner">
              <TunePanel />
            </div>
          </Tabs.Panel>
        </Tabs.Root>
      </section>
    </>
  )

}
