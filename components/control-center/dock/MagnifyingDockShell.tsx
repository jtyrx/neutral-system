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
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
  type RefObject,
} from 'react'
import {useSyncExternalStore} from 'react'

import {cn} from '@/lib/utils'

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
      for (const listener of reducedMotionListeners) {
        listener()
      }
    }
    mq.addEventListener('change', notify)
    reducedMotionUnsubscribe = () => {
      mq.removeEventListener('change', notify)
      reducedMotionUnsubscribe = null
    }
  }

  return () => {
    reducedMotionListeners.delete(onStoreChange)
    if (reducedMotionListeners.size === 0) {
      reducedMotionUnsubscribe?.()
    }
  }
}

export function useDockReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    () => false,
  )
}

const defaultSpring: SpringOptions = {mass: 0.1, stiffness: 180, damping: 14}

/**
 * Magnification falloff half-width in **rem** (plan default ~9rem ≈ 144px at 16px root).
 * Matched to `clientX` / layout measurements in CSS px via ×16 below.
 */
export const DOCK_MAGNIFY_DISTANCE_REM = 9 as const

/** `clientX` in CSS px; assume 16px-per-rem for motion tuning. */
const DEFAULT_MAGNIFY_DISTANCE_PX = DOCK_MAGNIFY_DISTANCE_REM * 16

/** `gap-2` between dock toolbar items. */
export const DOCK_MAGNIFY_GAP_PX = 8

/** Horizontal padding from `px-2` on the dock panel. */
export const DOCK_MAGNIFY_PADDING_X_PX = 8

/** Top padding baseline (`pt-1.5`) — grows with magnification. */
export const DOCK_MAGNIFY_PADDING_TOP_PX = 8

export type DockItemRegistration = {
  magnifyIndex: number
  itemRef: RefObject<HTMLDivElement | null>
  scaleTarget: MotionValue<number>
  xTarget: MotionValue<number>
}

type DockRegistryContextValue = {
  registerItem: (entry: DockItemRegistration) => void
  unregisterItem: (magnifyIndex: number) => void
}

const DockRegistryContext = createContext<DockRegistryContextValue | null>(null)

type DockMotionContextValue = {
  spring: SpringOptions
  reduceMotion: boolean
}

const DockMotionContext = createContext<DockMotionContextValue | null>(null)

type DockMagnifyScratch = {
  centers: number[]
  extraHalfWidths: number[]
  scales: number[]
  translates: number[]
  widths: number[]
}

function createDockMagnifyScratch(): DockMagnifyScratch {
  return {
    centers: [],
    extraHalfWidths: [],
    scales: [],
    translates: [],
    widths: [],
  }
}

function fitScratchArray(array: number[], length: number) {
  array.length = length
  return array
}

function useMagnifyingDockShell() {
  const ctx = useContext(DockMotionContext)
  if (!ctx) {
    throw new Error('DockMagnifyItem must be used inside MagnifyingDockShell')
  }
  return ctx
}

function useDockRegistry() {
  const ctx = useContext(DockRegistryContext)
  if (!ctx) {
    throw new Error('DockMagnifyItem must be used inside MagnifyingDockShell')
  }
  return ctx
}

export type MagnifyingDockShellProps = {
  children: ReactNode
  className?: string
  /**
   * Curve half-width in **CSS pixels** (where magnification falls to baseline).
   * Default {@link DOCK_MAGNIFY_DISTANCE_REM} × 16 (~144px).
   */
  distance?: number
  /** Peak magnification scale at cursor (default 1.32). */
  magnificationScale?: number
  spring?: SpringOptions
  /**
   * Merged onto the dock panel — tuned ring + drop shadow + surface mix
   * (`boxShadow`, `backgroundColor`). When `boxShadow` is set, default Tailwind
   * `ring` / `shadow-*` are omitted.
   */
  shellStyle?: CSSProperties
}

export function MagnifyingDockShell({
  children,
  className,
  distance: distanceProp,
  magnificationScale = 1.32,
  spring = defaultSpring,
  shellStyle,
}: MagnifyingDockShellProps) {
  const shellRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<Map<number, DockItemRegistration>>(new Map())
  const sortedItemsRef = useRef<DockItemRegistration[]>([])
  const scratchRef = useRef<DockMagnifyScratch>(createDockMagnifyScratch())
  const frameRef = useRef(0)
  const pendingClientXRef = useRef<number | null>(null)
  const reduceMotion = useDockReducedMotion()

  const shellPadXTarget = useMotionValue(DOCK_MAGNIFY_PADDING_X_PX)
  const shellPadTopTarget = useMotionValue(DOCK_MAGNIFY_PADDING_TOP_PX)
  const shellPadXSpring = useSpring(shellPadXTarget, spring)
  const shellPadTopSpring = useSpring(shellPadTopTarget, spring)

  const distance = distanceProp ?? DEFAULT_MAGNIFY_DISTANCE_PX

  const resetMagnification = useCallback(() => {
    const sorted = sortedItemsRef.current
    for (let i = 0; i < sorted.length; i++) {
      const item = sorted[i]
      item.scaleTarget.set(1)
      item.xTarget.set(0)
    }
    shellPadXTarget.set(DOCK_MAGNIFY_PADDING_X_PX)
    shellPadTopTarget.set(DOCK_MAGNIFY_PADDING_TOP_PX)
  }, [shellPadTopTarget, shellPadXTarget])

  const applyMagnification = useCallback(
    (clientX: number) => {
      const sorted = sortedItemsRef.current
      if (sorted.length === 0) return

      if (reduceMotion || !Number.isFinite(clientX)) {
        resetMagnification()
        return
      }

      const shellEl = shellRef.current
      if (!shellEl) return

      const shellRect = shellEl.getBoundingClientRect()
      const n = sorted.length
      const scratch = scratchRef.current
      const centers = fitScratchArray(scratch.centers, n)
      const extraHalfWidths = fitScratchArray(scratch.extraHalfWidths, n)
      const scales = fitScratchArray(scratch.scales, n)
      const translates = fitScratchArray(scratch.translates, n)
      const widths = fitScratchArray(scratch.widths, n)

      const padLeft = shellPadXSpring.get()
      const baseLeft = shellRect.left + padLeft
      let cursorX = baseLeft
      let maxHeight = 44

      for (let i = 0; i < n; i++) {
        const el = sorted[i].itemRef.current
        const width = el?.offsetWidth ?? 0
        if (width <= 0) return

        const height = el?.offsetHeight ?? 0
        widths[i] = width
        if (height > maxHeight) maxHeight = height

        centers[i] = cursorX + width / 2
        cursorX += width + (i < n - 1 ? DOCK_MAGNIFY_GAP_PX : 0)
      }

      const peakExtra = magnificationScale - 1
      const falloff = Math.max(16, distance)
      let maxScale = -Infinity
      let totalExtraHalfWidth = 0

      for (let i = 0; i < n; i++) {
        const dx = clientX - centers[i]
        const t = Math.min(1, Math.abs(dx) / falloff)
        const scale = 1 + Math.max(0, 1 - t * t) * peakExtra
        const extraHalfWidth = (scale - 1) * widths[i] * 0.5

        scales[i] = scale
        extraHalfWidths[i] = extraHalfWidth
        totalExtraHalfWidth += extraHalfWidth
        if (scale > maxScale) maxScale = scale
      }

      let leftExtraHalfWidth = 0
      for (let i = 0; i < n; i++) {
        const currentExtraHalfWidth = extraHalfWidths[i]
        const rightExtraHalfWidth =
          totalExtraHalfWidth - leftExtraHalfWidth - currentExtraHalfWidth
        const translate = leftExtraHalfWidth - rightExtraHalfWidth

        translates[i] = translate
        leftExtraHalfWidth += currentExtraHalfWidth
      }

      for (let i = 0; i < n; i++) {
        sorted[i].scaleTarget.set(scales[i])
        sorted[i].xTarget.set(translates[i])
      }

      let minL = Infinity
      let maxR = -Infinity
      for (let i = 0; i < n; i++) {
        const cx = centers[i] + translates[i]
        const half = (widths[i] * scales[i]) / 2
        minL = Math.min(minL, cx - half)
        maxR = Math.max(maxR, cx + half)
      }
      const restLeft = centers[0] - widths[0] / 2
      const restRight = centers[n - 1] + widths[n - 1] / 2
      const magnifiedWidth = maxR - minL
      const restWidth = restRight - restLeft
      const extraTotal = Math.max(0, magnifiedWidth - restWidth)
      const padExtraEach = extraTotal / 2
      shellPadXTarget.set(DOCK_MAGNIFY_PADDING_X_PX + padExtraEach)

      const extraTop = (maxScale - 1) * maxHeight * 0.52
      shellPadTopTarget.set(DOCK_MAGNIFY_PADDING_TOP_PX + extraTop)
    },
    [
      distance,
      magnificationScale,
      reduceMotion,
      resetMagnification,
      shellPadXSpring,
      shellPadTopTarget,
      shellPadXTarget,
    ],
  )

  const registerItem = useCallback((entry: DockItemRegistration) => {
    itemsRef.current.set(entry.magnifyIndex, entry)
    sortedItemsRef.current = [...itemsRef.current.values()].sort(
      (a, b) => a.magnifyIndex - b.magnifyIndex,
    )
  }, [])

  const unregisterItem = useCallback((magnifyIndex: number) => {
    itemsRef.current.delete(magnifyIndex)
    sortedItemsRef.current = sortedItemsRef.current.filter(
      (entry) => entry.magnifyIndex !== magnifyIndex,
    )
  }, [])

  const cancelPendingMagnification = useCallback(() => {
    if (frameRef.current !== 0) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
    pendingClientXRef.current = null
  }, [])

  const flushMagnification = useCallback(() => {
    frameRef.current = 0
    const clientX = pendingClientXRef.current
    pendingClientXRef.current = null
    if (clientX === null) return
    applyMagnification(clientX)
  }, [applyMagnification])

  useLayoutEffect(() => {
    if (!reduceMotion) return
    cancelPendingMagnification()
    resetMagnification()
  }, [cancelPendingMagnification, reduceMotion, resetMagnification])

  useLayoutEffect(() => {
    return () => {
      cancelPendingMagnification()
    }
  }, [cancelPendingMagnification])

  const handlePointerMove = useCallback(
    ({clientX}: PointerEvent<HTMLDivElement>) => {
      pendingClientXRef.current = clientX
      if (frameRef.current !== 0) return
      frameRef.current = requestAnimationFrame(flushMagnification)
    },
    [flushMagnification],
  )

  const handlePointerLeave = useCallback(() => {
    cancelPendingMagnification()
    resetMagnification()
  }, [cancelPendingMagnification, resetMagnification])

  const registryValue = useMemo(
    () => ({
      registerItem,
      unregisterItem,
    }),
    [registerItem, unregisterItem],
  )

  const motionShellValue = useMemo(
    () => ({
      spring,
      reduceMotion,
    }),
    [spring, reduceMotion],
  )

  const shellMotionStyle = useMemo(
    () => ({
      ...shellStyle,
      ...(reduceMotion
        ? {
            paddingLeft: DOCK_MAGNIFY_PADDING_X_PX,
            paddingRight: DOCK_MAGNIFY_PADDING_X_PX,
            paddingTop: DOCK_MAGNIFY_PADDING_TOP_PX,
          }
        : {
            paddingLeft: shellPadXSpring,
            paddingRight: shellPadXSpring,
            paddingTop: shellPadTopSpring,
          }),
    }),
    [reduceMotion, shellPadTopSpring, shellPadXSpring, shellStyle],
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
          className={cn('cc-dock-panel', className)}
          role="toolbar"
          aria-label="Picker dock"
        >
          {children}
        </motion.div>
      </DockRegistryContext.Provider>
    </DockMotionContext.Provider>
  )
}

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
    registerItem({
      magnifyIndex,
      itemRef: ref,
      scaleTarget,
      xTarget,
    })
    return () => {
      unregisterItem(magnifyIndex)
    }
  }, [magnifyIndex, registerItem, unregisterItem, scaleTarget, xTarget])

  return (
    <motion.div
      data-slot="dock-item"
      data-dock-item={dataDockItem}
      className={cn('cc-dock-item rounded-dock-item', className)}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
    >
      <motion.div
        ref={ref}
        data-slot="dock-item-magnify"
        style={itemMotionStyle}
        className="cc-dock-item-magnify"
      >
        {children}
      </motion.div>
    </motion.div>
  )
}
