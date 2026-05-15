'use client'

import {memo, useLayoutEffect, useRef} from 'react'

import type {ComparisonLayout} from '@/components/preview/PreviewComparison'
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group'
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

const CONTROL_ITEM = 'ns-control-item px-2.5 py-1 capitalize'

const COMPARISON_LAYOUT_OPTIONS = [
  'split',
  'focus',
] as const satisfies readonly ComparisonLayout[]

const FRACTION_SLASH = '\u2044'

function isComparisonLayout(value: unknown): value is ComparisonLayout {
  return (
    typeof value === 'string' &&
    COMPARISON_LAYOUT_OPTIONS.includes(value as ComparisonLayout)
  )
}

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
          {/* <p className="eyebrow">Neutral System</p> */}
          <p className="font-mono text-label text-muted uppercase text-trim-both leading-none">
            <span className="mx-1.25 inline-block font-bold text-trim-both">
              {FRACTION_SLASH}
            </span>
            Workbench
          </p>
          {/* <h1 className="mt-0.5 font-mono text-label text-default uppercase">
            Workbench
          </h1> */}
        </div>

        <div
          id="nsb-workbench-controls"
          className="flex min-w-0 flex-wrap items-center gap-2 nsb-lg:justify-end"
        >
          <RadioGroup
            aria-label="Comparison layout"
            variant="scrim"
            value={comparisonLayout}
            onValueChange={(value) => {
              if (isComparisonLayout(value)) {
                onComparisonLayoutChange(value)
              }
            }}
            className={cn(
              'ns-control-group ',
              '**:data-[slot=radio-group-indicator]:hidden',
            )}
          >
            {COMPARISON_LAYOUT_OPTIONS.map((layout) => {
              const active = comparisonLayout === layout
              return (
                <RadioGroupItem
                  key={layout}
                  value={layout}
                  variant="scrim"
                  className={cn(
                    CONTROL_ITEM,
                    'cursor-pointer rounded-full border border-transparent outline-none',
                    'focus-visible:border-(--color-border-focus) focus-visible:ring-2 focus-visible:ring-(--color-border-focus)/30',
                    active
                      ? 'bg-raised text-default data-checked:bg-raised data-checked:text-default'
                      : 'text-muted hover:text-default',
                  )}
                >
                  {layout}
                </RadioGroupItem>
              )
            })}
          </RadioGroup>

          <ThemePreviewControls
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
                : 'border-hairline bg-overlay-soft text-subtle hover:text-default',
            )}
          >
            <span
              aria-hidden
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                inspectionMode ? 'bg-emerald-300' : 'bg-overlay-strong',
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
