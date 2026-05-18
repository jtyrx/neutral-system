'use client'

import {memo, useLayoutEffect, useRef} from 'react'

import type {ComparisonLayout} from '@/components/preview/PreviewComparison'
import {ComparisonLayoutPicker} from '@/components/workbench/ComparisonLayoutPicker'
import {InspectionToggle} from '@/components/workbench/InspectionToggle'
import {ThemePreviewControls} from '@/components/workbench/ThemePreviewControls'
import type {ContrastEmphasis} from '@/lib/neutral-engine'
import { Button } from '../ui/button'

// A1: previewTheme / onPreviewTheme removed — never consumed in this component.
type Props = {
  contrastEmphasis: ContrastEmphasis
  onContrastEmphasis: (e: ContrastEmphasis, label?: string) => void
  showContrastPairs: boolean
  onShowContrastPairs: (v: boolean) => void
  comparisonLayout: ComparisonLayout
  onComparisonLayoutChange: (l: ComparisonLayout) => void
  inspectionMode: boolean
  onToggleInspection: () => void
}

const FRACTION_SLASH = '⁄'

function WorkbenchHeaderInner({
  contrastEmphasis,
  onContrastEmphasis,
  showContrastPairs,
  onShowContrastPairs,
  comparisonLayout,
  onComparisonLayoutChange,
  inspectionMode,
  onToggleInspection,
}: Props) {
  const headerRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const header = headerRef.current
    const workbench = header?.closest<HTMLElement>('#nsb-workbench')
    if (!header || !workbench) return undefined

    const syncHeaderHeight = () => {
      const height = Math.ceil(header.getBoundingClientRect().height)
      workbench.style.setProperty('--ns-workbench-header-height', `${height}px`)
    }

    syncHeaderHeight()

    const observer = new ResizeObserver(syncHeaderHeight)
    observer.observe(header)
    window.addEventListener('resize', syncHeaderHeight)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncHeaderHeight)
      workbench.style.removeProperty('--ns-workbench-header-height')
    }
  }, [])

  return (
    <header
      ref={headerRef}
      id="nsb-workbench-header"
      className="ns-workbench__header"
    >
      <div className="flex flex-col gap-3 px-4 py-3 sm:px-6 nsb-lg:flex-row nsb-lg:items-center nsb-lg:justify-between nsb-lg:px-8">
        <div className="min-w-0">
          <p className="font-mono text-label text-muted uppercase text-trim-both leading-none">
            <span className="mx-1.25 inline-block font-bold text-trim-both">
              {FRACTION_SLASH}
            </span>
            Workbench
          </p>
        </div>

        {/* A3: each control region is a named component */}
        <div
          id="nsb-workbench-controls"
          className="flex min-w-0 flex-wrap items-center gap-2 nsb-lg:justify-end"
        >

          <Button>
            <span>Comparison Layout</span>
            <span>{comparisonLayout}</span>
          </Button>
          <ComparisonLayoutPicker
            value={comparisonLayout}
            onChange={onComparisonLayoutChange}
          />

          <ThemePreviewControls
            contrastEmphasis={contrastEmphasis}
            onContrastEmphasis={onContrastEmphasis}
            showContrastPairs={showContrastPairs}
            onShowContrastPairs={onShowContrastPairs}
            dense
          />

          <InspectionToggle active={inspectionMode} onToggle={onToggleInspection} />
        </div>
      </div>
    </header>
  )
}

export const WorkbenchHeader = memo(WorkbenchHeaderInner)
