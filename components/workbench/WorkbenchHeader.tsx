'use client'

import {memo, useLayoutEffect, useRef} from 'react'

import type {ComparisonLayout} from '@/components/preview/PreviewComparison'
import {ThemePreviewControls} from '@/components/workbench/ThemePreviewControls'
import {cn} from '@/lib/cn'
import type {ContrastEmphasis} from '@/lib/neutral-engine'

type Props = {
  previewTheme: 'light' | 'dark'
  onPreviewTheme: (t: 'light' | 'dark', label?: string) => void
  contrastEmphasis: ContrastEmphasis
  onContrastEmphasis: (e: ContrastEmphasis, label?: string) => void
  showContrastPairs: boolean
  onShowContrastPairs: (v: boolean) => void
  comparisonLayout: ComparisonLayout
  onComparisonLayoutChange: (l: ComparisonLayout) => void
  inspectionMode: boolean
  onToggleInspection: () => void
}

const CONTROL_ITEM = 'ns-control-item px-2.5 py-1 uppercase tracking-[0.12em]'

const FRACTION_SLASH = '\u2044'

function WorkbenchHeaderInner({
  previewTheme,
  onPreviewTheme,
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
          {/* <p className="eyebrow">Neutral System</p> */}
          <p className="font-mono text-[0.8125rem] text-muted uppercase text-trim-both leading-none">
            <span className="mx-1.25 inline-block font-bold text-trim-both">
              {FRACTION_SLASH}
            </span>
            Workbench
          </p>
          {/* <h1 className="mt-0.5 font-mono text-[0.8125rem] text-default uppercase">
            Workbench
          </h1> */}
        </div>

        <div
          id="nsb-workbench-controls"
          className="flex min-w-0 flex-wrap items-center gap-2 nsb-lg:justify-end"
        >
          <div
            role="group"
            aria-label="Comparison layout"
            className="ns-control-group bg-(--ns-overlay-soft) text-[0.6rem]"
          >
            {(['split', 'focus'] as const).map((layout) => {
              const active = comparisonLayout === layout
              return (
                <button
                  key={layout}
                  type="button"
                  onClick={() => onComparisonLayoutChange(layout)}
                  aria-pressed={active}
                  className={cn(
                    CONTROL_ITEM,
                    active
                      ? 'bg-(--ns-overlay-strong) text-(--ns-text)'
                      : 'text-(--ns-text-muted) hover:text-(--ns-text-subtle)',
                  )}
                >
                  {layout}
                </button>
              )
            })}
          </div>

          <ThemePreviewControls
            previewTheme={previewTheme}
            onPreviewTheme={onPreviewTheme}
            contrastEmphasis={contrastEmphasis}
            onContrastEmphasis={onContrastEmphasis}
            showContrastPairs={showContrastPairs}
            onShowContrastPairs={onShowContrastPairs}
            dense
          />

          <button
            type="button"
            onClick={onToggleInspection}
            aria-pressed={inspectionMode}
            className={cn(
              'ns-control-item ns-pill border tracking-[0.12em] uppercase',
              inspectionMode
                ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100'
                : 'border-(--ns-hairline) bg-(--ns-overlay-soft) text-(--ns-text-subtle) hover:text-(--ns-text)',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                inspectionMode ? 'bg-emerald-300' : 'bg-(--ns-overlay-strong)',
              )}
            />
            Inspection {inspectionMode ? 'on' : 'off'}
          </button>
        </div>
      </div>
    </header>
  )
}

export const WorkbenchHeader = memo(WorkbenchHeaderInner)
