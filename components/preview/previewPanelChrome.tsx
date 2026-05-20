'use client'

import {cva} from 'class-variance-authority'

/**
 * **Lane accent** for preview chrome: light preview lane → amber mixers (`--chrome-amber-*`),
 * dark-elevated lane → sky mixers (`--chrome-sky-*`). This is chromatic scaffolding for the
 * two-lane comparison UI, not a semantic text/surface role; derive from theme via
 * `previewChromeToneForRampLane` in `lib/workbench/rampPreviewCopy`.
 */
export type PreviewChromeTone = 'amber' | 'sky'

/** Alias — same union, emphasizes “lane” vs raw color naming. */
export type PreviewLaneChromeAccent = PreviewChromeTone

export const previewChromePanelVariants = cva('rounded-titlebar border-none', {
  variants: {
    tone: {
      // amber: 'border-(--chrome-amber-border) bg-(--chrome-amber-surface)',
      amber: 'bg-transparent',
      // sky: 'border-(--chrome-sky-border) bg-(--chrome-sky-surface)',
      sky: 'bg-transparent',
    },
    layout: {
      focus: 'p-12 sm:p-16',
      splitLight: 'px-12 py-12 sm:px-14 sm:py-16',
      splitDark: 'p-12 sm:p-16',
      /** Dock picker ramp cards — snug padding alongside chrome tint */
      dock: 'px-12 py-12 sm:px-2 sm:py-2',
    },
  },
})

export const previewThemeBadgeVariants = cva(
  'rounded-titlebar px-8 py-2 font-mono text-[0.6rem]',
  {
    variants: {
      tone: {
        amber: 'bg-(--chrome-amber-pill) text-(--chrome-amber-text)',
        sky: 'bg-(--chrome-sky-pill) text-(--chrome-sky-text)',
      },
    },
  },
)

export const previewPanelHeaderRowClass =
  'mb-12 flex flex-wrap items-baseline justify-between gap-8'

export function rampCardAccentClass(
  tone: PreviewChromeTone,
  ring: 'strong' | 'soft',
): string {
  if (tone === 'amber') {
    return ring === 'strong'
      ? ' ring-(--chrome-amber-ring)'
      : ' ring-(--chrome-amber-ring-soft)'
      // ? 'ring-1 ring-(--chrome-amber-ring)'
      // : 'ring-1 ring-(--chrome-amber-ring-soft)'
  }
  return ring === 'strong'
    ? ' ring-(--chrome-sky-ring)'
    : ' ring-(--chrome-sky-ring-soft)'
    // ? 'ring-1 ring-(--chrome-sky-ring)'
    // : 'ring-1 ring-(--chrome-sky-ring-soft)'
}

export type PreviewPanelHeadingProps = {
  eyebrow: string
  title: string
  tone: PreviewChromeTone
  badgeLabel: string
}

export function PreviewPanelHeading({
  eyebrow,
  title,
  tone,
  badgeLabel,
}: PreviewPanelHeadingProps) {
  return (
    <div className={previewPanelHeaderRowClass}>
      <div>
        <p className="sr-only">{eyebrow}</p>
        <p className="mt-2 text-[0.75rem] text-muted">
          {title}
        </p>
      </div>
      <span className={previewThemeBadgeVariants({tone})}>{badgeLabel}</span>
    </div>
  )
}
