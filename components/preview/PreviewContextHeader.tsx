'use client'

import type {ComparisonLayout} from '@/components/preview/PreviewComparison'
import {cn} from '@/lib/cn'
import type {ContrastEmphasis} from '@/lib/neutral-engine'

type Props = {
  comparisonLayout: ComparisonLayout
  previewTheme: 'light' | 'dark'
  contrastEmphasis: ContrastEmphasis
  inspectionMode: boolean
  onToggleInspection: () => void
  onComparisonLayoutChange: (l: ComparisonLayout) => void
}

const FRACTION_SLASH = '\u2044'

const CONTRAST_LABEL: Record<ContrastEmphasis, string> = {
  subtle: 'Subtle',
  default: 'Default',
  strong: 'Strong',
  inverse: 'Inverse',
}

const CONTROL_ITEM = 'ns-control-item px-2.5 py-1 uppercase tracking-[0.12em]'

function Pill({label, value}: {label: string; value: string}) {
  return (
    <span className="ns-pill border border-(--ns-hairline) bg-(--ns-overlay-soft) text-(--ns-text-subtle)">
      <span className="uppercase tracking-[0.12em] text-(--ns-text-faint)">{label}</span>
      <span className="text-(--ns-text)">{value}</span>
    </span>
  )
}

/**
 * Sticky context bar above the preview blocks — communicates the current inspection frame
 * (comparison layout, active theme when focused, contrast emphasis) and hosts the inspection toggle.
 */
export function PreviewContextHeader({
  comparisonLayout,
  previewTheme,
  contrastEmphasis,
  inspectionMode,
  onToggleInspection,
  onComparisonLayoutChange,
}: Props) {
  const themeLabel = previewTheme === 'light' ? 'Light' : 'Dark elevated'

  return (
    <div className="sticky top-0 z-20 border-b border-(--ns-hairline) bg-(--ns-surface-raised) backdrop-blur supports-[backdrop-filter]:bg-(--ns-surface-raised)">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col">
          <p className="text-[0.8125rem] font-mono uppercase text-(--ns-text-muted) text-default">
            <span className="mx-1.25 inline-block text-trim-both font-bold">{FRACTION_SLASH}</span>Workbench
          </p>
          {/* TODO: Add a description of the workbench */}
          {/* <p className="mt-0.5 text-xs text-(--ns-text-subtle)">
            Semantic inspection — resolved tokens shared with exports.
          </p> */}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Comparison layout"
            className="ns-control-group bg-(--ns-overlay-soft) text-[0.6rem]"
          >
            {(['split', 'focus'] as const).map((l) => {
              const active = comparisonLayout === l
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => onComparisonLayoutChange(l)}
                  aria-pressed={active}
                  className={cn(
                    CONTROL_ITEM,
                    active
                      ? 'bg-(--ns-hairline) text-(--ns-text)'
                      : 'text-(--ns-text-muted) hover:text-(--ns-text-subtle)',
                  )}
                >
                  {l}
                </button>
              )
            })}
          </div>

          {comparisonLayout === 'focus' ? <Pill label="Theme" value={themeLabel} /> : null}
          <Pill label="Contrast" value={CONTRAST_LABEL[contrastEmphasis]} />

          <button
            type="button"
            onClick={onToggleInspection}
            aria-pressed={inspectionMode}
            className={cn(
              'ns-pill ns-control-item border uppercase tracking-[0.12em]',
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
            Inspection · {inspectionMode ? 'on' : 'off'}
          </button>
        </div>
      </div>
    </div>
  )
}
