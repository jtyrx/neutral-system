'use client'

import {AnimatePresence, motion} from 'motion/react'
import {useMemo, useRef, type CSSProperties} from 'react'

import {useControlCenterViewportBounds} from '@/hooks/useControlCenterViewportMaxHeight'
import {useControlCenterState} from '@/hooks/useControlCenterState'
import {ControlCenterPanel} from '@/components/control-center/panel/ControlCenterPanel'
import {
  useDockElevationTuning,
  isDockChromeTuningEnabled,
  isDockHaloEnabled,
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

// ─── Magic index ──────────────────────────────────────────────────────────────
// ThemeCycleButton opts out of magnification by using a very large index so it
// sits visually separated at the trailing edge of the dock without physics influence.
const THEME_DOCK_MAGNIFY_INDEX = 10000

// ─── Animation constants ──────────────────────────────────────────────────────

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

// ─── Class constants ──────────────────────────────────────────────────────────

const rootClassName =
  'pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-[max(0.5rem,env(safe-area-inset-bottom))] sm:pb-[max(0.75rem,env(safe-area-inset-bottom))] [--cc-dock-bottom-offset:max(0.5rem,env(safe-area-inset-bottom))] sm:[--cc-dock-bottom-offset:max(0.75rem,env(safe-area-inset-bottom))]'

const pageBlurClassName = 'absolute inset-x-0 bottom-0 z-40 max-w-none'

const viewportBaseClassName =
  'pointer-events-auto relative z-50 flex min-h-0 w-full max-w-[min(92vw,62rem)] flex-col items-center overflow-x-hidden overscroll-y-contain px-2 [contain:layout_style] [max-height:var(--cc-viewport-max-height,calc(100dvh-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)-1.5rem))] data-[state=expanded]:fixed data-[state=expanded]:top-auto data-[state=expanded]:left-1/2 data-[state=expanded]:bottom-(--cc-dock-bottom-offset) data-[state=expanded]:w-[min(calc(var(--cc-visual-width,100vw)-1rem),62rem)] data-[state=expanded]:max-w-[min(calc(var(--cc-visual-width,100vw)-1rem),62rem)] data-[state=expanded]:-translate-x-1/2 data-[state=expanded]:overflow-y-visible'

const panelStageClassName =
  'flex min-h-0 max-h-(--cc-viewport-max-height) w-full shrink-0 justify-center overflow-visible [contain:layout_style]'

const dockSystemClassName =
  'relative isolate flex w-max max-w-full origin-bottom items-end justify-center gap-1.5 overflow-visible motion-safe:will-change-transform [--cc-secondary-dock-width:min(26rem,max(9rem,calc(92vw-11.75rem)))]'

const secondaryDockClassName =
  'relative z-0 flex h-15 min-w-0 w-(--cc-secondary-dock-width) origin-left items-stretch rounded-2xl border border-hairline bg-[color-mix(in_oklch,var(--color-surface-overlay)_55%,transparent)] p-2 shadow-[0_18px_48px_-20px_rgb(0_0_0_/_0.45),0_4px_12px_-6px_rgb(0_0_0_/_0.28)] [contain:layout_style_paint] before:absolute before:top-[0.5625rem] before:bottom-[0.5625rem] before:left-[-0.75rem] before:-z-1 before:w-5 before:rounded-full before:bg-[color-mix(in_oklch,var(--color-surface-overlay)_58%,transparent)] before:shadow-[0_10px_26px_-16px_rgb(0_0_0_/_0.5),inset_0_0_0_1px_color-mix(in_oklch,var(--chrome-hairline)_80%,transparent)] before:blur-[0.25px] supports-[backdrop-filter:blur(1px)]:backdrop-blur-[24px] supports-[backdrop-filter:blur(1px)]:backdrop-saturate-125 dark:bg-[color-mix(in_oklch,var(--color-surface-overlay)_48%,transparent)] dark:before:bg-[color-mix(in_oklch,var(--color-surface-overlay)_52%,transparent)] motion-safe:will-change-[transform,opacity,clip-path,filter]'

const secondaryDockRailClassName = 'h-full min-h-0 rounded-dock-item'

// ─── Component ────────────────────────────────────────────────────────────────

/** Picker dock: OKLCH launcher, live ramp swatch, theme cycle; expands to steps controls. */
export function ControlCenter() {
  const reduceMotion = useDockReducedMotion()
  const launcherRef = useRef<HTMLButtonElement>(null)
  const dockShellRef = useRef<HTMLDivElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)

  const viewportBounds = useControlCenterViewportBounds(dockShellRef)
  const {pageBlur, halo, dockChrome} = useDockElevationTuning()

  const {
    expanded,
    swatchDockOpen,
    viewportMaxStyle,
    collapse,
    open,
    toggleSwatchDock,
    handlePanelAnimationComplete,
    handleDockAnimationComplete,
  } = useControlCenterState({viewportRef, viewportBounds, reduceMotion})

  const collapsedHaloNeedsViewportBleed = isDockHaloEnabled(halo)

  const shellStyle = useMemo((): CSSProperties | undefined => {
    if (!isDockChromeTuningEnabled(dockChrome)) return undefined
    const {shadowOffsetY: y, shadowBlur, shadowSpread, shadowOpacity, surfaceMixPercent, ringOpacityPercent} = dockChrome
    const ring = `0 0 0 1px color-mix(in oklch, var(--ring) ${ringOpacityPercent}%, transparent)`
    const drop = `0 ${y}px ${shadowBlur}px ${shadowSpread}px rgba(0,0,0,${shadowOpacity})`
    return {
      boxShadow: `${ring}, ${drop}`,
      ...(surfaceMixPercent >= 100
        ? {}
        : {backgroundColor: `color-mix(in oklch, var(--color-surface-overlay) ${surfaceMixPercent}%, transparent)`}),
    }
  }, [dockChrome])

  const restExit = reduceMotion ? REST_EXIT_REDUCED : REST_EXIT
  const panelTransition = useMemo(
    () => ({duration: reduceMotion ? 0.12 : 0.22, ease: easeSurface}),
    [reduceMotion],
  )
  const restTransition = useMemo(
    () => ({duration: reduceMotion ? 0.12 : 0.2, ease: easeSurface}),
    [reduceMotion],
  )

  const secondaryDockInitial = reduceMotion ? false : SECONDARY_DOCK_INITIAL
  const secondaryDockIn = reduceMotion ? undefined : SECONDARY_DOCK_ANIMATE
  const secondaryDockExit = reduceMotion ? undefined : SECONDARY_DOCK_EXIT
  const secondaryDockTransition = reduceMotion ? undefined : SECONDARY_DOCK_TRANSITION

  const dockToolbar = useMemo(
    () => (
      <motion.div
        data-slot="dock-system"
        data-swatch-dock-open={swatchDockOpen ? 'true' : undefined}
        className={dockSystemClassName}
        layout="position"
        transition={restTransition}
      >
        <MagnifyingDockShell shellStyle={shellStyle}>
          <DockMagnifyItem magnifyIndex={0} className="shrink-0" data-dock-item="oklch-launcher">
            <OklchLauncherButton ref={launcherRef} onOpen={open} />
          </DockMagnifyItem>
          <DockMagnifyItem magnifyIndex={1} className="shrink-0" data-dock-item="ramp-range">
            <RampRangeButton
              aria-label={swatchDockOpen ? 'Hide ramp rail dock' : 'Show ramp rail dock'}
              aria-pressed={swatchDockOpen}
              onOpen={toggleSwatchDock}
            />
          </DockMagnifyItem>
          <DockMagnifyItem magnifyIndex={THEME_DOCK_MAGNIFY_INDEX} className="shrink-0" data-dock-item="theme-cycle">
            <ThemeCycleButton />
          </DockMagnifyItem>
        </MagnifyingDockShell>
        <AnimatePresence initial={false}>
          {swatchDockOpen ? (
            <motion.div
              key="secondary-ramp-rail"
              data-slot="dock-item"
              data-dock-item="ramp-rail"
              className={secondaryDockClassName}
              initial={secondaryDockInitial}
              animate={secondaryDockIn}
              exit={secondaryDockExit}
              transition={secondaryDockTransition}
            >
              <RampSwatchRail className={secondaryDockRailClassName} />
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
    <div ref={dockShellRef} data-slot="app-dock" id="app-dock" className={rootClassName}>
      {pageBlur.enabled ? (
        <PageProgressiveBlur
          className={pageBlurClassName}
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
          viewportBaseClassName,
          expanded ? 'overflow-y-visible' : collapsedHaloNeedsViewportBleed ? 'overflow-y-visible' : 'overflow-y-auto',
        )}
        style={viewportMaxStyle}
      >
        <AnimatePresence mode="wait" initial={false}>
          {expanded ? (
            <motion.div
              key="picker-surface"
              className={panelStageClassName}
              initial={EXPANDED_INITIAL}
              animate={EXPANDED_ANIMATE}
              exit={EXPANDED_EXIT}
              transition={panelTransition}
              onAnimationComplete={handlePanelAnimationComplete}
            >
              <ControlCenterPanel onClose={collapse} launcherReturnRef={launcherRef} />
            </motion.div>
          ) : (
            <motion.div
              key="dock-rest"
              data-slot="cc-rest-stage"
              className="flex w-full justify-center"
              initial={false}
              animate={REST_ANIMATE}
              exit={restExit}
              transition={restTransition}
              onAnimationComplete={handleDockAnimationComplete}
            >
              {isDockHaloEnabled(halo) ? (
                <ElevationProgressiveBlur
                  spread={halo.spread}
                  layerCount={halo.layerCount}
                  maxBlurPx={halo.maxBlurPx}
                  curve={halo.curve}
                  tension={halo.tension}
                  radius="1rem"
                  bias={halo.bias}
                  softness={halo.softness}
                  className="flex w-full justify-center"
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
