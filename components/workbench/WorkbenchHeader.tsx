'use client'

import {memo, useLayoutEffect, useRef} from 'react'

import type {ComparisonLayout} from '@/components/preview/composed/PreviewComparison'
import {ComparisonLayoutPicker} from '@/components/workbench/ComparisonLayoutPicker'
import {InspectionToggle} from '@/components/workbench/InspectionToggle'
import {ThemePreviewControls} from '@/components/workbench/ThemePreviewControls'
import type {ContrastEmphasis} from '@/lib/neutral-engine'
import {Button, ButtonLink} from '../ui/button'

import type {ContrastModel} from '@/lib/neutral-engine/contrastModel'

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
  contrastModel: ContrastModel
  onContrastModelChange: (m: ContrastModel) => void
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
  contrastModel,
  onContrastModelChange,
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
    const resizeOptions: AddEventListenerOptions = {passive: true}
    window.addEventListener('resize', syncHeaderHeight, resizeOptions)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', syncHeaderHeight, resizeOptions)
      workbench.style.removeProperty('--ns-workbench-header-height')
    }
  }, [])

  return (
    <header
      ref={headerRef}
      id="nsb-workbench-header"
      className="ns-workbench__header"
    >
      <div className="flex flex-col gap-12 px-16 py-12 sm:px-24 nsb-lg:flex-row nsb-lg:items-center nsb-lg:justify-between nsb-lg:px-32">
        <div className="min-w-0 cursor-default">
          <p className="font-mono text-label leading-none text-muted uppercase text-trim-both">
            <span className="mx-5 inline-block font-bold text-trim-both">
              {FRACTION_SLASH}
            </span>
            Workbench
          </p>
        </div>

        {/* A3: each control region is a named component */}
        <div
          id="nsb-workbench-controls"
          className="flex min-w-0 flex-wrap cursor-pointer items-center gap-8 nsb-lg:justify-end"
        >
          {/* <ButtonLink href="https://www.google.com" size="sm">
            Link
          </ButtonLink> */}
          <Button variant="default" size="sm">
            Default - {comparisonLayout}
          </Button>
          <Button variant="secondary" size="sm">
            Secondary
          </Button>
          <Button variant="outline" size="sm">
            Outline
          </Button>
          <Button variant="ghost" size="sm">
            Ghost
          </Button>
          <Button variant="destructive" size="sm">
            Destructive
          </Button>
          <Button variant="link" size="sm">
            Link
          </Button>
          <Button
            variant={contrastModel === 'apca' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onContrastModelChange(contrastModel === 'apca' ? 'wcag-2.1' : 'apca')}
          >
            {contrastModel === 'apca' ? 'Lc (APCA)' : 'WCAG 2.1'}
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
          <InspectionToggle
            active={inspectionMode}
            onToggle={onToggleInspection}
          />
        </div>
      </div>
    </header>
  )
}

export const WorkbenchHeader = memo(WorkbenchHeaderInner)
