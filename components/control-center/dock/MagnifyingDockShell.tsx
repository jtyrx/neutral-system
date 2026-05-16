'use client'

import {
  motion,
  useMotionValue,
  useSpring,
  type MotionValue,
  type SpringOptions,
  type TargetAndTransition,
  type Transition,
  type VariantLabels,
} from 'motion/react'
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from 'react'
import {useSyncExternalStore} from 'react'

import {useDockMagnification} from '@/components/control-center/dock/useDockMagnification'
import {cn} from '@/lib/utils'

// ─── Reduced-motion subscription ─────────────────────────────────────────────
// Module-level singleton: one MediaQueryList + one native listener shared across all
// consumers, cleaned up when the last subscriber unmounts.

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'
const reducedMotionListeners = new Set<() => void>()

let reducedMotionQueryList: MediaQueryList | null = null
let reducedMotionUnsubscribe: (() => void) | null = null

function getReducedMotionQueryList() {
  if (typeof window === 'undefined') return null
  reducedMotionQueryList ??= window.matchMedia(REDUCED_MOTION_QUERY)
  return reducedMotionQueryList
}

function getReducedMotionSnapshot() {
  return getReducedMotionQueryList()?.matches ?? false
}

function subscribeReducedMotion(onStoreChange: () => void) {
  const mq = getReducedMotionQueryList()
  if (!mq) return () => {}

  reducedMotionListeners.add(onStoreChange)

  if (!reducedMotionUnsubscribe) {
    const notify = () => {
      for (const listener of reducedMotionListeners) listener()
    }
    mq.addEventListener('change', notify)
    reducedMotionUnsubscribe = () => {
      mq.removeEventListener('change', notify)
      reducedMotionUnsubscribe = null
    }
  }

  return () => {
    reducedMotionListeners.delete(onStoreChange)
    if (reducedMotionListeners.size === 0) reducedMotionUnsubscribe?.()
  }
}

export function useDockReducedMotion(): boolean {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false)
}

// ─── Constants ────────────────────────────────────────────────────────────────

const defaultSpring: SpringOptions = {mass: 0.1, stiffness: 180, damping: 14}

/**
 * Magnification falloff half-width in **rem** (plan default ~9rem ≈ 144px at 16px root).
 * Matched to `clientX` / layout measurements in CSS px via ×16 in `useDockMagnification`.
 */
export const DOCK_MAGNIFY_DISTANCE_REM = 9 as const

/** `gap-2` between dock toolbar items. */
export const DOCK_MAGNIFY_GAP_PX = 8

/** Horizontal padding from `px-2` on the dock panel. */
export const DOCK_MAGNIFY_PADDING_X_PX = 8

/** Top padding baseline (`pt-1.5`) — grows with magnification. */
export const DOCK_MAGNIFY_PADDING_TOP_PX = 8

// ─── Shared types ─────────────────────────────────────────────────────────────

export type DockItemRegistration = {
  magnifyIndex: number
  itemRef: RefObject<HTMLDivElement | null>
  scaleTarget: MotionValue<number>
  xTarget: MotionValue<number>
}

// ─── Contexts ─────────────────────────────────────────────────────────────────

type DockRegistryContextValue = {
  registerItem: (entry: DockItemRegistration) => void
  unregisterItem: (magnifyIndex: number) => void
}

type DockMotionContextValue = {
  spring: SpringOptions
  reduceMotion: boolean
}

const DockRegistryContext = createContext<DockRegistryContextValue | null>(null)
DockRegistryContext.displayName = 'DockRegistryContext'

const DockMotionContext = createContext<DockMotionContextValue | null>(null)
DockMotionContext.displayName = 'DockMotionContext'

function useMagnifyingDockShell() {
  const ctx = useContext(DockMotionContext)
  if (!ctx) throw new Error('DockMagnifyItem must be used inside MagnifyingDockShell')
  return ctx
}

function useDockRegistry() {
  const ctx = useContext(DockRegistryContext)
  if (!ctx) throw new Error('DockMagnifyItem must be used inside MagnifyingDockShell')
  return ctx
}

// ─── Class constants ──────────────────────────────────────────────────────────

const dockPanelClassName =
  'relative z-1 isolate flex items-end justify-center gap-2 rounded-2xl border border-hairline bg-[color-mix(in_oklch,var(--color-surface-overlay)_55%,transparent)] pb-2 shadow-[0_18px_48px_-20px_rgb(0_0_0_/_0.55),0_4px_12px_-6px_rgb(0_0_0_/_0.35)] [contain:layout_style] supports-[backdrop-filter:blur(1px)]:backdrop-blur-[24px] supports-[backdrop-filter:blur(1px)]:backdrop-saturate-125 dark:bg-[color-mix(in_oklch,var(--color-surface-overlay)_48%,transparent)]'

const dockItemClassName =
  'flex origin-bottom items-end justify-center rounded-dock-item motion-safe:will-change-[opacity,transform,clip-path]'

const dockItemMagnifyClassName =
  'flex min-w-0 w-full origin-bottom items-end justify-center rounded-[inherit] motion-safe:will-change-transform'

// ─── MagnifyingDockShell ──────────────────────────────────────────────────────

export type MagnifyingDockShellProps = {
  children: ReactNode
  className?: string
  /**
   * Curve half-width in CSS pixels (where magnification falls to baseline).
   * Default {@link DOCK_MAGNIFY_DISTANCE_REM} × 16 (~144px).
   */
  distance?: number
  /** Peak magnification scale at cursor (default 1.32). */
  magnificationScale?: number
  spring?: SpringOptions
  /**
   * Merged onto the dock panel — tuned ring + drop shadow + surface mix.
   * When `boxShadow` is set, default Tailwind `ring` / `shadow-*` are omitted.
   */
  shellStyle?: CSSProperties
}

export function MagnifyingDockShell({
  children,
  className,
  distance,
  magnificationScale = 1.32,
  spring = defaultSpring,
  shellStyle,
}: MagnifyingDockShellProps) {
  const reduceMotion = useDockReducedMotion()

  const {
    shellRef,
    shellMotionStyle,
    handlePointerMove,
    handlePointerLeave,
    registerItem,
    unregisterItem,
  } = useDockMagnification({distance, magnificationScale, spring, reduceMotion, shellStyle})

  const registryValue = useMemo(
    () => ({registerItem, unregisterItem}),
    [registerItem, unregisterItem],
  )

  const motionShellValue = useMemo(
    () => ({spring, reduceMotion}),
    [spring, reduceMotion],
  )

  return (
    <DockMotionContext.Provider value={motionShellValue}>
      <DockRegistryContext.Provider value={registryValue}>
        <motion.div
          ref={shellRef}
          data-slot="dock-panel"
          id="app-dock-panel"
          style={shellMotionStyle}
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          data-custom-surface={shellStyle?.backgroundColor ? 'true' : undefined}
          data-custom-elevation={shellStyle?.boxShadow ? 'true' : undefined}
          className={cn(dockPanelClassName, className)}
          role="toolbar"
          aria-label="Picker dock"
        >
          {children}
        </motion.div>
      </DockRegistryContext.Provider>
    </DockMotionContext.Provider>
  )
}

// ─── DockMagnifyItem ──────────────────────────────────────────────────────────

export type DockMagnifyItemProps = {
  children: ReactNode
  /** Reading order for reflow math (0 = leftmost). */
  magnifyIndex: number
  className?: string
  'data-dock-item'?: string
  initial?: VariantLabels | TargetAndTransition | boolean
  animate?: VariantLabels | TargetAndTransition | boolean
  exit?: VariantLabels | TargetAndTransition
  transition?: Transition
}

export function DockMagnifyItem({
  children,
  magnifyIndex,
  className,
  'data-dock-item': dataDockItem,
  initial,
  animate,
  exit,
  transition,
}: DockMagnifyItemProps) {
  const {spring, reduceMotion} = useMagnifyingDockShell()
  const {registerItem, unregisterItem} = useDockRegistry()

  const ref = useRef<HTMLDivElement>(null)
  const scaleTarget = useMotionValue(1)
  const xTarget = useMotionValue(0)
  const scaleSpring = useSpring(scaleTarget, spring)
  const xSpring = useSpring(xTarget, spring)

  const itemMotionStyle = useMemo(
    () => ({
      scale: reduceMotion ? 1 : scaleSpring,
      x: reduceMotion ? 0 : xSpring,
      transformOrigin: '50% 100%',
    }),
    [reduceMotion, scaleSpring, xSpring],
  )

  useLayoutEffect(() => {
    registerItem({magnifyIndex, itemRef: ref, scaleTarget, xTarget})
    return () => unregisterItem(magnifyIndex)
  }, [magnifyIndex, registerItem, unregisterItem, scaleTarget, xTarget])

  return (
    <motion.div
      data-slot="dock-item"
      data-dock-item={dataDockItem}
      className={cn(dockItemClassName, className)}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
    >
      <motion.div
        ref={ref}
        data-slot="dock-item-magnify"
        style={itemMotionStyle}
        className={dockItemMagnifyClassName}
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
