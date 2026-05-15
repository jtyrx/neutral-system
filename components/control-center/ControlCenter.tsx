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
import {useControlCenterMeasurement} from '@/hooks/useControlCenterMeasurement'
import {ControlCenterPanel} from '@/components/control-center/panel/ControlCenterPanel'
import {
  useDockElevationTuning,
  isDockChromeTuningEnabled,
  isDockHaloBarEnabled,
} from '@/components/control-center/debug/ControlCenterElevationProvider'
import {RampSwatchRail} from '@/components/control-center/ramp/RampSwatchRail'
import {
  OklchLauncherButton,
  ThemeCycleButton,
} from '@/components/control-center/dock/DockActionButton'
import {RampRangeButton} from '@/components/control-center/dock/DockRampRangeButton'
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

const SECONDARY_DOCK_INITIAL = {
  opacity: 0,
  x: -18,
  scaleX: 0.12,
  filter: 'blur(8px)',
  clipPath: 'inset(0 100% 0 0 round 1rem)',
}
const SECONDARY_DOCK_ANIMATE = {
  opacity: 1,
  x: 0,
  scaleX: 1,
  filter: 'blur(0px)',
  clipPath: 'inset(0 0% 0 0 round 1rem)',
}
const SECONDARY_DOCK_EXIT = {
  opacity: 0,
  x: -12,
  scaleX: 0.16,
  filter: 'blur(6px)',
  clipPath: 'inset(0 100% 0 0 round 1rem)',
}
const SECONDARY_DOCK_TRANSITION = {
  duration: 0.24,
  ease: easeSurface,
  opacity: {duration: 0.14, ease: easeSurface},
  filter: {duration: 0.16, ease: easeSurface},
}

const EXPANDED_INITIAL = {opacity: 0}
const EXPANDED_ANIMATE = {opacity: 1}
const EXPANDED_EXIT = {opacity: 0}
const REST_ANIMATE = {opacity: 1, y: 0, scale: 1}
const REST_EXIT = {opacity: 0, y: 18, scale: 0.98}
const REST_EXIT_REDUCED = {opacity: 0}


/** Picker dock: OKLCH launcher, live ramp swatch, theme cycle; expands to steps controls. */
export function ControlCenter() {
  const [expanded, setExpanded] = useState(false)
  const [swatchDockOpen, setSwatchDockOpen] = useState(false)
  const reduceMotion = useDockReducedMotion()
  const launcherRef = useRef<HTMLButtonElement>(null)
  const dockShellRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const viewportBounds = useControlCenterViewportBounds(dockShellRef)
  const {pageBlur, halo, dockChrome} = useDockElevationTuning()

  /** Collapsed halo uses negative inset; keep that state from clipping the blur envelope. */
  const collapsedHaloNeedsViewportBleed = isDockHaloBarEnabled(halo)

  const contentHeight = useControlCenterMeasurement(viewportRef, expanded)
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
    return contentHeight > 0
      ? Math.min(contentHeight + 2, available)
      : available
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
    setSwatchDockOpen(false)
    setIsTransitioning(true)
    setExpanded(true)
  }, [])

  const toggleSwatchDock = useCallback(() => {
    setSwatchDockOpen((open) => !open)
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

  const secondaryDockInitial = reduceMotion ? false : SECONDARY_DOCK_INITIAL
  const secondaryDockIn = reduceMotion ? undefined : SECONDARY_DOCK_ANIMATE
  const secondaryDockExit = reduceMotion ? undefined : SECONDARY_DOCK_EXIT
  const secondaryDockTransition = reduceMotion
    ? undefined
    : SECONDARY_DOCK_TRANSITION

  const dockToolbar = useMemo(
    () => (
      <motion.div
        data-slot="dock-system"
        data-swatch-dock-open={swatchDockOpen ? 'true' : undefined}
        className="cc-dock-system"
        layout="position"
        transition={restTransition}
      >
        <MagnifyingDockShell shellStyle={shellStyle}>
          <DockMagnifyItem
            magnifyIndex={0}
            className="shrink-0"
            data-dock-item="oklch-launcher"
          >
            <OklchLauncherButton ref={launcherRef} onOpen={open} />
          </DockMagnifyItem>
          <DockMagnifyItem
            key="swatch"
            magnifyIndex={1}
            className="shrink-0"
            data-dock-item="ramp-range"
          >
            <RampRangeButton
              aria-label={
                swatchDockOpen ? 'Hide ramp rail dock' : 'Show ramp rail dock'
              }
              aria-pressed={swatchDockOpen}
              onOpen={toggleSwatchDock}
            />
          </DockMagnifyItem>
          <DockMagnifyItem
            magnifyIndex={THEME_DOCK_MAGNIFY_INDEX}
            className="shrink-0"
            data-dock-item="theme-cycle"
          >
            <ThemeCycleButton />
          </DockMagnifyItem>
        </MagnifyingDockShell>
        <AnimatePresence initial={false}>
          {swatchDockOpen ? (
            <motion.div
              key="secondary-ramp-rail"
              data-slot="dock-item"
              data-dock-item="ramp-rail"
              className="cc-secondary-dock"
              initial={secondaryDockInitial}
              animate={secondaryDockIn}
              exit={secondaryDockExit}
              transition={secondaryDockTransition}
            >
              <RampSwatchRail className="cc-secondary-dock-rail" />
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    ),
    [
      open,
      restTransition,
      secondaryDockExit,
      secondaryDockIn,
      secondaryDockInitial,
      secondaryDockTransition,
      shellStyle,
      swatchDockOpen,
      toggleSwatchDock,
    ],
  )

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
