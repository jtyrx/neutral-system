import {
  previewPanelHeaderRowClass,
  previewThemeBadgeVariants,
  type PreviewChromeTone,
} from '@/components/preview/previewChrome'

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
        <p className="mt-2 text-xs text-muted">
          {title}
        </p>
      </div>
      <span className={previewThemeBadgeVariants({tone})}>{badgeLabel}</span>
    </div>
  )
}
PreviewPanelHeading.displayName = 'PreviewPanelHeading'
