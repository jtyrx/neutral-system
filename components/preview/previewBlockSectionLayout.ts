import {cn} from '@/lib/cn'

/** Section chrome density — card is the default preview shell. */
export type PreviewSectionShell = 'card' | 'flat' | 'flush'

/** Light / dark comparison column rhythm inside a section. */
export type PreviewComparisonSplitGap = 'default' | 'wide' | 'tight'

/** Whole-section max-width on the `<section>` element. */
export type PreviewSectionWidth = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full'

/** Horizontal placement when section is narrower than the workbench column. */
export type PreviewSectionAlign = 'start' | 'center'

/** Unified section size tier (shell + footprint + comparison). */
export type PreviewSectionTier = 'compact' | 'standard' | 'wide' | 'canvas'

export type PreviewBlockSectionLayout = {
  /** Outer section shell. `flush` drops card chrome so wide matrices can scroll horizontally. */
  shell?: PreviewSectionShell
  /** Max width for the entire section (header + chrome + specimens). */
  sectionWidth?: PreviewSectionWidth
  /** Horizontal alignment when section width is capped. */
  sectionAlign?: PreviewSectionAlign
  /** Extra classes on the `<section>` element. */
  sectionClassName?: string
  /** Vertical rhythm between header and specimen content. */
  headerContentGap?: 'default' | 'tight'
  /** Classes on the content slot (theme comparison wrapper). */
  contentClassName?: string
  comparison?: {
    splitGap?: PreviewComparisonSplitGap
    splitClassName?: string
    frameClassName?: string
    frameContentClassName?: string
    /** Hide Light / Dark elevated pills when specimens are self-explanatory. */
    hideLabels?: boolean
  }
}

const STANDARD_LAYOUT = {
  shell: 'card',
  headerContentGap: 'default',
  sectionWidth: 'md',
  sectionAlign: 'start',
} satisfies PreviewBlockSectionLayout

/** Fallback when a block omits `sectionLayout` (prefer explicit tiers in the registry). */
export const defaultPreviewBlockSectionLayout = STANDARD_LAYOUT

const SHELL_CLASS: Record<PreviewSectionShell, string> = {
  card: 'ns-overlay-card space-y-12',
  flat: cn(
    'relative overflow-visible rounded-control border border-hairline',
    'bg-default/50 p-8 sm:p-10',
    'space-y-10',
  ),
  flush: 'relative space-y-8 overflow-visible',
}

const HEADER_CONTENT_GAP: Record<'default' | 'tight', string> = {
  default: '',
  tight: '[&>header]:pb-8 [&>header+div]:pt-0 space-y-8',
}

const SPLIT_GAP_CLASS: Record<PreviewComparisonSplitGap, string> = {
  default: 'gap-20 md:gap-24',
  wide: 'gap-24 md:gap-32',
  tight: 'gap-12 md:gap-16',
}

const SECTION_WIDTH_CLASS: Record<PreviewSectionWidth, string> = {
  xs: 'max-w-sm',
  sm: 'max-w-md',
  md: 'max-w-2xl',
  lg: 'max-w-4xl',
  xl: 'max-w-6xl',
  full: 'max-w-none',
}

const SECTION_ALIGN_CLASS: Record<PreviewSectionAlign, string> = {
  start: 'mr-auto',
  center: 'mx-auto',
}

/** Tighter overlay-card padding for low-mass specimens. */
const COMPACT_SECTION_PADDING = '!p-8 sm:!p-10'

export type ResolvedPreviewBlockSectionLayout = {
  shell: PreviewSectionShell
  headerContentGap: 'default' | 'tight'
  sectionWidth: PreviewSectionWidth
  sectionAlign: PreviewSectionAlign
  sectionClassName?: string
  contentClassName?: string
  comparison?: PreviewBlockSectionLayout['comparison']
}

export function resolvePreviewBlockSectionLayout(
  layout: PreviewBlockSectionLayout | undefined,
): ResolvedPreviewBlockSectionLayout {
  const resolved: ResolvedPreviewBlockSectionLayout = {
    shell: layout?.shell ?? defaultPreviewBlockSectionLayout.shell,
    headerContentGap:
      layout?.headerContentGap ?? defaultPreviewBlockSectionLayout.headerContentGap,
    sectionWidth: layout?.sectionWidth ?? defaultPreviewBlockSectionLayout.sectionWidth,
    sectionAlign: layout?.sectionAlign ?? defaultPreviewBlockSectionLayout.sectionAlign,
  }
  if (layout?.sectionClassName != null) {
    resolved.sectionClassName = layout.sectionClassName
  }
  if (layout?.contentClassName != null) {
    resolved.contentClassName = layout.contentClassName
  }
  if (layout?.comparison != null) {
    resolved.comparison = layout.comparison
  }
  return resolved
}

export function previewSectionShellClass(shell: PreviewSectionShell): string {
  return SHELL_CLASS[shell]
}

export function previewSectionHeaderContentGapClass(
  gap: 'default' | 'tight',
): string {
  return HEADER_CONTENT_GAP[gap]
}

export function previewSectionWidthClass(width: PreviewSectionWidth): string {
  return cn('w-full', SECTION_WIDTH_CLASS[width])
}

export function previewSectionAlignClass(align: PreviewSectionAlign): string {
  return SECTION_ALIGN_CLASS[align]
}

export function previewComparisonSplitClass(
  gap: PreviewComparisonSplitGap = 'default',
  extra?: string,
): string {
  return cn('grid grid-cols-1 md:grid-cols-2', SPLIT_GAP_CLASS[gap], extra)
}

/**
 * Named size tiers for preview block sections.
 * Assign explicitly on each `PreviewBlockCase` in the registry.
 */
export const previewSectionLayouts = {
  /** Single-column controls, minimal vertical mass. */
  compact: {
    shell: 'card',
    sectionClassName: COMPACT_SECTION_PADDING,
    headerContentGap: 'tight',
    sectionWidth: 'sm',
    sectionAlign: 'start',
    comparison: {splitGap: 'default'},
  },
  /** Typical component specimens (cards, callouts, form sets). */
  standard: STANDARD_LAYOUT,
  /** Horizontal specimens with room but not full bleed (shell, ladders). */
  wide: {
    shell: 'flat',
    headerContentGap: 'tight',
    sectionWidth: 'xl',
    sectionAlign: 'start',
    comparison: {splitGap: 'wide', hideLabels: true},
  },
  /** Matrices, swatch grids, and wide tables with horizontal scroll. */
  canvas: {
    shell: 'flush',
    headerContentGap: 'tight',
    sectionWidth: 'full',
    sectionAlign: 'start',
    contentClassName: 'min-w-0',
    comparison: {splitGap: 'tight'},
  },
} as const satisfies Record<PreviewSectionTier, PreviewBlockSectionLayout>
