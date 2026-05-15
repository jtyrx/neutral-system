'use client'

import {useEffect, useState, type RefObject} from 'react'

const PICKER_OVERLAY_SELECTOR = '[data-slot="dock-picker-overlay-tier"]'
const PICKER_CONTROLS_SELECTOR = '[data-slot="dock-picker-controls-tier"]'
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
  const tablist = viewport.querySelector<HTMLElement>('[data-slot="control-center-tablist"]')
  const inner = viewport.querySelector<HTMLElement>('[data-slot="tabpanel-inner"]')
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

/**
 * Observes the Control Center viewport's active content height via ResizeObserver and
 * MutationObserver. Re-attaches whenever `expanded` changes. Returns the measured height
 * in pixels so the caller can drive `max-height` animations.
 */
export function useControlCenterMeasurement(
  viewportRef: RefObject<HTMLDivElement | null>,
  expanded: boolean,
): number {
  const [contentHeight, setContentHeight] = useState(0)

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
        const preview = viewport.querySelector<HTMLElement>(PICKER_OVERLAY_SELECTOR)
        const controls = viewport.querySelector<HTMLElement>(PICKER_CONTROLS_SELECTOR)
        if (!preview || !controls) {
          // Panel not mounted yet (AnimatePresence wait mode); watch for it
          mo = new MutationObserver(attachObservers)
          mo.observe(viewport, {childList: true, subtree: false})
          return
        }
        const measure = () => {
          commitContentHeight(measureExpandedContentHeight(viewport, preview, controls))
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
  }, [viewportRef, expanded])

  return contentHeight
}
