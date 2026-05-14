'use client'

import {AnimatePresence, motion, useMotionValue, animate} from 'motion/react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react'

import {useControlCenterViewportBounds} from '@/hooks/useControlCenterViewportMaxHeight'
import {ControlCenterPanel} from '@/components/control-center/panel/ControlCenterPanel'
import {
  useDockElevationTuning,
  isDockChromeTuningEnabled,
  isDockHaloBarEnabled,
} from '@/components/control-center/debug/ControlCenterElevationProvider'
import {DockRampSegments} from '@/components/control-center/dock/DockRampSegments'
import {OklchLauncherButton, ThemeCycleButton} from '@/components/control-center/dock/DockActionButton'
import {
  DockMagnifyItem,
  MagnifyingDockShell,
  useDockReducedMotion,
} from '@/components/control-center/dock/MagnifyingDockShell'
import {ElevationProgressiveBlur} from '@/components/ui/elevation-progressive-blur'
import {PageProgressiveBlur} from '@/components/ui/page-progressive-blur'
import {cn} from '@/lib/utils'
import {easeSurface} from '@/lib/effects/easings'

type ViewportStyle = CSSProperties & {
  '--cc-viewport-max-height'?: string
  '--cc-visual-width'?: string
}

const THEME_DOCK_MAGNIFY_INDEX = 10000

const EXPANDED_INITIAL = {opacity: 0}
const EXPANDED_ANIMATE = {opacity: 1}
const EXPANDED_EXIT = {opacity: 0}
const REST_ANIMATE = {opacity: 1, y: 0, scale: 1}
const REST_EXIT = {opacity: 0, y: 18, scale: 0.98}
const REST_EXIT_REDUCED = {opacity: 0}

const PICKER_OVERLAY_SELECTOR = '[data-slot="dock-picker-overlay-tier"]'
const PICKER_CONTROLS_SELECTOR = '[data-slot="dock-picker-controls-tier"]'
const TABLIST_SELECTOR = '[data-slot="control-center-tablist"]'
const TABPANEL_INNER_SELECTOR = '[data-slot="tabpanel-inner"]'
const REST_STAGE_SELECTOR = '[data-slot="cc-rest-stage"]'

function cssPx(value: string, fallback = 0) {
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

function measureExpandedContentHeight(
  viewport: HTMLElement,
  preview: HTMLElement,
  controls: HTMLElement,
) {
  const tablist = viewport.querySelector<HTMLElement>(TABLIST_SELECTOR)
  const inner = viewport.querySelector<HTMLElement>(TABPANEL_INNER_SELECTOR)
  const activePanel = inner?.parentElement as HTMLElement | null
  const activePanelStyle = activePanel ? getComputedStyle(activePanel) : null
  const controlsStyle = getComputedStyle(controls)

  return (
    preview.offsetHeight +
    cssPx(controlsStyle.paddingTop) +
    (tablist?.offsetHeight ?? 32) +
    (activePanelStyle ? cssPx(activePanelStyle.paddingTop, 10) : 10) +
    (inner?.scrollHeight ?? 0) +
    (activePanelStyle ? cssPx(activePanelStyle.paddingBottom, 12) : 12)
  )
}

/** Picker dock: OKLCH launcher, live ramp swatch, theme cycle; expands to steps controls. */
export function ControlCenter() {
  const [expanded, setExpanded] = useState(false)
  const reduceMotion = useDockReducedMotion()
  const launcherRef = useRef<HTMLButtonElement>(null)
  const dockShellRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const viewportBounds = useControlCenterViewportBounds(dockShellRef)
  const {pageBlur, halo, dockChrome} = useDockElevationTuning()

  /** Collapsed halo uses negative inset; keep that state from clipping the blur envelope. */
  const collapsedHaloNeedsViewportBleed = isDockHaloBarEnabled(halo)

  // Content-driven max-height state
  const [contentHeight, setContentHeight] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  // Last settled max-height — held during AnimatePresence exit so exiting content isn't clipped
  const [prevMaxHeight, setPrevMaxHeight] = useState(0)

  // Refs for use inside animation callbacks (always current, no closure staleness)
  const expandedRef = useRef(false)
  const contentHeightRef = useRef(0)
  const availableHeightRef = useRef(0)

  useLayoutEffect(() => {
    expandedRef.current = expanded
    contentHeightRef.current = contentHeight
    availableHeightRef.current = viewportBounds?.maxHeight ?? 0
  }, [contentHeight, expanded, viewportBounds])

  // Observe active content height. Re-attaches whenever expanded changes.
  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    let ro: ResizeObserver | null = null
    let mo: MutationObserver | null = null
    let measureFrame = 0

    const cancelMeasure = () => {
      if (measureFrame === 0) return
      cancelAnimationFrame(measureFrame)
      measureFrame = 0
    }

    const cleanupObservers = () => {
      ro?.disconnect()
      mo?.disconnect()
      ro = null
      mo = null
    }

    const cleanup = () => {
      cancelMeasure()
      cleanupObservers()
    }

    const scheduleMeasure = (measure: () => void) => {
      cancelMeasure()
      measureFrame = requestAnimationFrame(() => {
        measureFrame = 0
        measure()
      })
    }

    const commitContentHeight = (next: number) => {
      setContentHeight((prev) => (prev === next ? prev : next))
    }

    const attachObservers = () => {
      cancelMeasure()
      cleanupObservers()
      if (expanded) {
        const preview = viewport.querySelector<HTMLElement>(
          PICKER_OVERLAY_SELECTOR,
        )
        const controls = viewport.querySelector<HTMLElement>(
          PICKER_CONTROLS_SELECTOR,
        )
        if (!preview || !controls) {
          // Panel not mounted yet (AnimatePresence wait mode); watch for it
          mo = new MutationObserver(attachObservers)
          mo.observe(viewport, {childList: true, subtree: false})
          return
        }
        const measure = () => {
          commitContentHeight(
            measureExpandedContentHeight(viewport, preview, controls),
          )
        }
        const schedule = () => scheduleMeasure(measure)
        ro = new ResizeObserver(schedule)
        ro.observe(preview)
        ro.observe(controls)
        // Catch tab switches (panel mount/unmount) and accordion-style expansions
        mo = new MutationObserver(schedule)
        mo.observe(controls, {childList: true, subtree: true})
        measure()
      } else {
        const stage = viewport.querySelector<HTMLElement>(REST_STAGE_SELECTOR)
        if (!stage) return
        const measure = () => commitContentHeight(stage.offsetHeight)
        const schedule = () => scheduleMeasure(measure)
        ro = new ResizeObserver(schedule)
        ro.observe(stage)
        measure()
      }
    }

    attachObservers()
    return cleanup
  }, [expanded])

  const justSettledRef = useRef(false)
  const heightMV = useMotionValue(0)

  const settleTransition = useCallback(() => {
    const content = contentHeightRef.current
    const available = availableHeightRef.current
    setPrevMaxHeight(content > 0 ? Math.min(content + 2, available) : available)
    justSettledRef.current = true
    setIsTransitioning(false)
  }, [])

  // Only settle when the ENTERING element completes its animation.
  // onAnimationComplete fires for both enter and exit; use expandedRef to discriminate.
  const handlePanelAnimationComplete = useCallback(() => {
    if (!expandedRef.current) return // panel is exiting, not entering
    settleTransition()
  }, [settleTransition])

  const handleDockAnimationComplete = useCallback(() => {
    if (expandedRef.current) return // dock is exiting, not entering
    settleTransition()
  }, [settleTransition])

  const finalMaxHeight = useMemo(() => {
    if (!viewportBounds) return null
    const available = viewportBounds.maxHeight
    if (isTransitioning) {
      // Expanding: full viewport so the panel renders at its natural size.
      // Collapsing: hold previous height so the exiting panel is never clipped.
      return expanded ? available : prevMaxHeight
    }
    // Stable: clamp measured content to available viewport; +2px avoids edge-case scrollbar.
    return contentHeight > 0 ? Math.min(contentHeight + 2, available) : available
  }, [viewportBounds, contentHeight, isTransitioning, expanded, prevMaxHeight])

  const viewportMaxStyle = useMemo((): ViewportStyle | undefined => {
    if (!viewportBounds) return undefined
    const base: ViewportStyle = {
      '--cc-visual-width': `${viewportBounds.visualWidth}px`,
    }
    if (!expanded) return base
    return {
      ...base,
      left: `${viewportBounds.centerX}px`,
    }
  }, [expanded, viewportBounds])

  // Animate --cc-viewport-max-height imperatively so the CSS variable cascade
  // (cc-panel-surface, cc-panel-shell-body, etc.) transitions smoothly on tab switches.
  useEffect(() => {
    if (finalMaxHeight === null) return
    const viewport = viewportRef.current
    if (!viewport) return

    const applyImmediate = (v: number) => {
      const next = `${v}px`
      heightMV.set(v)
      viewport.style.maxHeight = next
      viewport.style.setProperty('--cc-viewport-max-height', next)
    }

    if (isTransitioning || justSettledRef.current || reduceMotion) {
      justSettledRef.current = false
      applyImmediate(finalMaxHeight)
      return
    }

    const ctrl = animate(heightMV, finalMaxHeight, {
      duration: 0.22,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        const next = `${v}px`
        viewport.style.maxHeight = next
        viewport.style.setProperty('--cc-viewport-max-height', next)
      },
    })
    return () => ctrl.stop()
  }, [finalMaxHeight, isTransitioning, reduceMotion, heightMV])

  const collapse = useCallback(() => {
    setIsTransitioning(true)
    setExpanded(false)
  }, [])

  const open = useCallback(() => {
    setIsTransitioning(true)
    setExpanded(true)
  }, [])

  const shellStyle = useMemo((): CSSProperties | undefined => {
    if (!isDockChromeTuningEnabled(dockChrome)) return undefined
    const {
      shadowOffsetY: y,
      shadowBlur,
      shadowSpread,
      shadowOpacity,
      surfaceMixPercent,
      ringOpacityPercent,
    } = dockChrome
    const ring = `0 0 0 1px color-mix(in oklch, var(--ring) ${ringOpacityPercent}%, transparent)`
    const drop = `0 ${y}px ${shadowBlur}px ${shadowSpread}px rgba(0,0,0,${shadowOpacity})`
    return {
      boxShadow: `${ring}, ${drop}`,
      ...(surfaceMixPercent >= 100
        ? {}
        : {
            backgroundColor: `color-mix(in oklch, var(--color-surface-overlay) ${surfaceMixPercent}%, transparent)`,
          }),
    }
  }, [dockChrome])

  const restExit = reduceMotion ? REST_EXIT_REDUCED : REST_EXIT
  const panelTransition = useMemo(
    () => ({
      duration: reduceMotion ? 0.12 : 0.22,
      ease: easeSurface,
    }),
    [reduceMotion],
  )
  const restTransition = useMemo(
    () => ({
      duration: reduceMotion ? 0.12 : 0.2,
      ease: easeSurface,
    }),
    [reduceMotion],
  )

  const dockToolbar = useMemo(() => (
    <MagnifyingDockShell shellStyle={shellStyle}>
      <DockMagnifyItem
        magnifyIndex={0}
        className="shrink-0"
        data-dock-item="oklch-launcher"
      >
        <OklchLauncherButton ref={launcherRef} onOpen={open} />
      </DockMagnifyItem>
      <DockRampSegments startMagnifyIndex={1} />
      <DockMagnifyItem
        magnifyIndex={THEME_DOCK_MAGNIFY_INDEX}
        className="shrink-0"
        data-dock-item="theme-cycle"
      >
        <ThemeCycleButton />
      </DockMagnifyItem>
    </MagnifyingDockShell>
  ), [open, shellStyle])

  return (
    <div
      ref={dockShellRef}
      data-slot="app-dock"
      id="app-dock"
      className="cc-root"
    >
      {pageBlur.enabled ? (
        <PageProgressiveBlur
          className="cc-page-blur"
          direction={pageBlur.direction}
          layerCount={pageBlur.layerCount}
          maxBlurPx={pageBlur.maxBlurPx}
          featherPx={pageBlur.featherPx}
          curve={pageBlur.curve}
          tension={pageBlur.tension}
          radius={pageBlur.radius}
          tintOpacityPercent={pageBlur.tintOpacityPercent}
        />
      ) : null}
      <div
        ref={viewportRef}
        data-slot="app-dock-viewport"
        data-state={expanded ? 'expanded' : 'collapsed'}
        className={cn(
          'cc-viewport',
          expanded
            ? 'overflow-y-visible'
            : collapsedHaloNeedsViewportBleed
              ? 'overflow-y-visible'
              : 'overflow-y-auto',
        )}
        style={viewportMaxStyle}
      >
        <AnimatePresence mode="wait" initial={false}>
          {expanded ? (
            <motion.div
              key="picker-surface"
              className="cc-panel-stage"
              initial={EXPANDED_INITIAL}
              animate={EXPANDED_ANIMATE}
              exit={EXPANDED_EXIT}
              transition={panelTransition}
              onAnimationComplete={handlePanelAnimationComplete}
            >
              <ControlCenterPanel
                onClose={collapse}
                launcherReturnRef={launcherRef}
              />
            </motion.div>
          ) : (
            <motion.div
              key="dock-rest"
              data-slot="cc-rest-stage"
              className="cc-rest-stage"
              initial={false}
              animate={REST_ANIMATE}
              exit={restExit}
              transition={restTransition}
              onAnimationComplete={handleDockAnimationComplete}
            >
              {isDockHaloBarEnabled(halo) ? (
                <ElevationProgressiveBlur
                  spread={halo.spread}
                  layerCount={halo.layerCount}
                  maxBlurPx={halo.maxBlurPx}
                  curve={halo.curve}
                  tension={halo.tension}
                  radius="1rem"
                  bias={halo.bias}
                  softness={halo.softness}
                  className="cc-rest-stage"
                >
                  {dockToolbar}
                </ElevationProgressiveBlur>
              ) : (
                dockToolbar
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
