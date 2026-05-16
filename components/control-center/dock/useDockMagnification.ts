'use client'

import {useMotionValue, useSpring, type SpringOptions} from 'motion/react'
import {
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  type CSSProperties,
  type PointerEvent,
  type RefObject,
} from 'react'

// ─── Shared constants ─────────────────────────────────────────────────────────

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
  scaleTarget: import('motion/react').MotionValue<number>
  xTarget: import('motion/react').MotionValue<number>
}

const DEFAULT_MAGNIFY_DISTANCE_PX = DOCK_MAGNIFY_DISTANCE_REM * 16

type DockMagnifyScratch = {
  centers: number[]
  extraHalfWidths: number[]
  scales: number[]
  translates: number[]
  widths: number[]
}

function createScratch(): DockMagnifyScratch {
  return {centers: [], extraHalfWidths: [], scales: [], translates: [], widths: []}
}

function fitArray(arr: number[], len: number) {
  arr.length = len
  return arr
}

export type DockMagnificationOptions = {
  distance?: number
  magnificationScale?: number
  spring: SpringOptions
  reduceMotion: boolean
  shellStyle?: CSSProperties
}

export type DockMagnificationResult = {
  shellRef: RefObject<HTMLDivElement | null>
  shellMotionStyle: Record<string, unknown>
  handlePointerMove: (e: PointerEvent<HTMLDivElement>) => void
  handlePointerLeave: () => void
  registerItem: (entry: DockItemRegistration) => void
  unregisterItem: (magnifyIndex: number) => void
}

export function useDockMagnification({
  distance: distanceProp,
  magnificationScale = 1.32,
  spring,
  reduceMotion,
  shellStyle,
}: DockMagnificationOptions): DockMagnificationResult {
  const shellRef = useRef<HTMLDivElement>(null)
  const itemsRef = useRef<Map<number, DockItemRegistration>>(new Map())
  const sortedItemsRef = useRef<DockItemRegistration[]>([])
  const scratchRef = useRef<DockMagnifyScratch>(createScratch())
  const frameRef = useRef(0)
  const pendingClientXRef = useRef<number | null>(null)

  const shellPadXTarget = useMotionValue(DOCK_MAGNIFY_PADDING_X_PX)
  const shellPadTopTarget = useMotionValue(DOCK_MAGNIFY_PADDING_TOP_PX)
  const shellPadXSpring = useSpring(shellPadXTarget, spring)
  const shellPadTopSpring = useSpring(shellPadTopTarget, spring)

  const distance = distanceProp ?? DEFAULT_MAGNIFY_DISTANCE_PX

  const resetMagnification = useCallback(() => {
    for (const item of sortedItemsRef.current) {
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
      const centers = fitArray(scratch.centers, n)
      const extraHalfWidths = fitArray(scratch.extraHalfWidths, n)
      const scales = fitArray(scratch.scales, n)
      const translates = fitArray(scratch.translates, n)
      const widths = fitArray(scratch.widths, n)

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
        translates[i] = leftExtraHalfWidth - rightExtraHalfWidth
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
      const extraTotal = Math.max(0, maxR - minL - (restRight - restLeft))
      shellPadXTarget.set(DOCK_MAGNIFY_PADDING_X_PX + extraTotal / 2)
      shellPadTopTarget.set(DOCK_MAGNIFY_PADDING_TOP_PX + (maxScale - 1) * maxHeight * 0.52)
    },
    [distance, magnificationScale, reduceMotion, resetMagnification, shellPadXSpring, shellPadTopTarget, shellPadXTarget],
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

  const cancelPending = useCallback(() => {
    if (frameRef.current !== 0) {
      cancelAnimationFrame(frameRef.current)
      frameRef.current = 0
    }
    pendingClientXRef.current = null
  }, [])

  const flush = useCallback(() => {
    frameRef.current = 0
    const clientX = pendingClientXRef.current
    pendingClientXRef.current = null
    if (clientX !== null) applyMagnification(clientX)
  }, [applyMagnification])

  useLayoutEffect(() => {
    if (!reduceMotion) return
    cancelPending()
    resetMagnification()
  }, [cancelPending, reduceMotion, resetMagnification])

  useLayoutEffect(() => () => cancelPending(), [cancelPending])

  const handlePointerMove = useCallback(
    ({clientX}: PointerEvent<HTMLDivElement>) => {
      pendingClientXRef.current = clientX
      if (frameRef.current !== 0) return
      frameRef.current = requestAnimationFrame(flush)
    },
    [flush],
  )

  const handlePointerLeave = useCallback(() => {
    cancelPending()
    resetMagnification()
  }, [cancelPending, resetMagnification])

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

  return {
    shellRef,
    shellMotionStyle,
    handlePointerMove,
    handlePointerLeave,
    registerItem,
    unregisterItem,
  }
}
