'use client'

import type {ComparisonLayout} from '@/components/preview/PreviewComparison'
import type {ContrastEmphasis} from '@/lib/neutral-engine'

type Props = {
  comparisonLayout: ComparisonLayout
  previewTheme: 'light' | 'dark'
  contrastEmphasis: ContrastEmphasis
  inspectionMode: boolean
  onToggleInspection: () => void
  onComparisonLayoutChange: (l: ComparisonLayout) => void
}

const CONTRAST_LABEL: Record<ContrastEmphasis, string> = {
  subtle: 'Subtle',
  default: 'Default',
  strong: 'Strong',
  inverse: 'Inverse',
}

function Pill({label, value}: {label: string; value: string}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ns-hairline)] bg-[var(--ns-overlay-soft)] px-2.5 py-1 text-[0.6rem] text-[var(--ns-text-subtle)]">
      <span className="uppercase tracking-[0.12em] text-[var(--ns-text-faint)]">{label}</span>
      <span className="text-[var(--ns-text)]">{value}</span>
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
    <div className="sticky top-0 z-20 border-b border-[var(--ns-hairline)] bg-[var(--ns-surface-raised)] backdrop-blur supports-[backdrop-filter]:bg-[var(--ns-surface-raised)]">
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-col">
          <p className="text-[0.55rem] font-semibold uppercase tracking-[0.16em] text-[var(--ns-text-muted)]">
            Preview workbench
          </p>
          <p className="mt-0.5 text-xs text-[var(--ns-text-subtle)]">
            Semantic inspection — resolved tokens shared with exports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            role="group"
            aria-label="Comparison layout"
            className="inline-flex items-center rounded-full border border-[var(--ns-hairline)] bg-[var(--ns-overlay-soft)] p-0.5 text-[0.6rem]"
          >
            {(['split', 'focus'] as const).map((l) => {
              const active = comparisonLayout === l
              return (
                <button
                  key={l}
                  type="button"
                  onClick={() => onComparisonLayoutChange(l)}
                  aria-pressed={active}
                  className={`rounded-full px-2.5 py-1 uppercase tracking-[0.12em] transition-colors ${
                    active ? 'bg-[var(--ns-hairline)] text-[var(--ns-text)]' : 'text-[var(--ns-text-muted)] hover:text-[var(--ns-text-subtle)]'
                  }`}
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
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.12em] transition-colors ${
              inspectionMode
                ? 'border-emerald-400/50 bg-emerald-400/15 text-emerald-100'
                : 'border-[var(--ns-hairline)] bg-[var(--ns-overlay-soft)] text-[var(--ns-text-subtle)] hover:text-[var(--ns-text)]'
            }`}
          >
            <span
              aria-hidden
              className={`h-1.5 w-1.5 rounded-full ${inspectionMode ? 'bg-emerald-300' : 'bg-[var(--ns-overlay-strong)]'}`}
            />
            Inspection · {inspectionMode ? 'on' : 'off'}
          </button>
        </div>
      </div>
    </div>
  )
}
