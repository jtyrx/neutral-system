'use client'

import {animate, useMotionValue} from 'motion/react'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react'

import {useControlCenterMeasurement} from '@/hooks/useControlCenterMeasurement'
import {easeSurface} from '@/lib/effects/easings'
import type {ControlCenterViewportBounds} from '@/hooks/useControlCenterViewportMaxHeight'

type ViewportStyle = CSSProperties & {
  '--cc-viewport-max-height'?: string
  '--cc-visual-width'?: string
}

export type UseControlCenterStateOptions = {
  viewportRef: RefObject<HTMLDivElement | null>
  viewportBounds: ControlCenterViewportBounds | null
  reduceMotion: boolean
}

export type UseControlCenterStateResult = {
  expanded: boolean
  swatchDockOpen: boolean
  viewportMaxStyle: ViewportStyle | undefined
  collapse: () => void
  open: () => void
  toggleSwatchDock: () => void
  handlePanelAnimationComplete: () => void
  handleDockAnimationComplete: () => void
}

export function useControlCenterState({
  viewportRef,
  viewportBounds,
  reduceMotion,
}: UseControlCenterStateOptions): UseControlCenterStateResult {
  const [expanded, setExpanded] = useState(false)
  const [swatchDockOpen, setSwatchDockOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  // Holds the last settled max-height during AnimatePresence exit so content is not clipped.
  const [prevMaxHeight, setPrevMaxHeight] = useState(0)

  const contentHeight = useControlCenterMeasurement(viewportRef, expanded)

  // Refs always hold current values for use inside animation callbacks.
  const expandedRef = useRef(false)
  const contentHeightRef = useRef(0)
  const availableHeightRef = useRef(0)
  // Signals the height effect to apply the new value immediately (skip smooth animation)
  // after a panel enter/exit animation completes. Cleared by the effect itself.
  const skipNextAnimationRef = useRef(false)
  const heightMV = useMotionValue(0)

  useLayoutEffect(() => {
    expandedRef.current = expanded
    contentHeightRef.current = contentHeight
    availableHeightRef.current = viewportBounds?.maxHeight ?? 0
  }, [contentHeight, expanded, viewportBounds])

  const settleTransition = useCallback(() => {
    const content = contentHeightRef.current
    const available = availableHeightRef.current
    setPrevMaxHeight(content > 0 ? Math.min(content + 2, available) : available)
    skipNextAnimationRef.current = true
    setIsTransitioning(false)
  }, [])

  // `onAnimationComplete` fires for both enter and exit — guard with expandedRef.
  const handlePanelAnimationComplete = useCallback(() => {
    if (!expandedRef.current) return
    settleTransition()
  }, [settleTransition])

  const handleDockAnimationComplete = useCallback(() => {
    if (expandedRef.current) return
    settleTransition()
  }, [settleTransition])

  const finalMaxHeight = useMemo(() => {
    if (!viewportBounds) return null
    const available = viewportBounds.maxHeight
    if (isTransitioning) {
      return expanded ? available : prevMaxHeight
    }
    return contentHeight > 0 ? Math.min(contentHeight + 2, available) : available
  }, [viewportBounds, contentHeight, isTransitioning, expanded, prevMaxHeight])

  const viewportMaxStyle = useMemo((): ViewportStyle | undefined => {
    if (!viewportBounds) return undefined
    const base: ViewportStyle = {'--cc-visual-width': `${viewportBounds.visualWidth}px`}
    if (!expanded) return base
    return {...base, left: `${viewportBounds.centerX}px`}
  }, [expanded, viewportBounds])

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

    if (isTransitioning || skipNextAnimationRef.current || reduceMotion) {
      skipNextAnimationRef.current = false
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
  }, [finalMaxHeight, isTransitioning, reduceMotion, heightMV, viewportRef])

  const collapse = useCallback(() => {
    setIsTransitioning(true)
    setExpanded(false)
  }, [])

  const open = useCallback(() => {
    setSwatchDockOpen(false)
    setIsTransitioning(true)
    setExpanded(true)
  }, [])

  const toggleSwatchDock = useCallback(() => setSwatchDockOpen((v) => !v), [])

  return {
    expanded,
    swatchDockOpen,
    viewportMaxStyle,
    collapse,
    open,
    toggleSwatchDock,
    handlePanelAnimationComplete,
    handleDockAnimationComplete,
  }
}
