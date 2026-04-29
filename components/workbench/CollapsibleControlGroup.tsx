'use client'

import type {ReactNode} from 'react'

type Props = {
  id: string
  title: string
  subtitle?: string
  /**
   * Inline after `subtitle` in the summary row (e.g. AdditionalInfoPreviewCard).
   * Host owns composition; this wrapper only provides placement and text rhythm.
   */
  additionalInfo?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}

function ChevronDownIcon({className}: {className?: string}) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  )
}

/** Collapsible region for grouped builder controls (Scale / Contrast / Mapping). */
export function CollapsibleControlGroup({
  id,
  title,
  subtitle,
  additionalInfo,
  defaultOpen = true,
  children,
}: Props) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-sm border border-hairline bg-raised"
    >
      <summary className="cursor-pointer list-none px-4 py-3 sm:px-4 sm:py-3 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold tracking-tight text-default">
              {title}
            </p>
            {subtitle ?? additionalInfo ? (
              <p className="mt-1 text-xs text-muted">
                {subtitle ? <>{subtitle}</> : null}
                {subtitle && additionalInfo ? <> </> : null}
                {additionalInfo}
              </p>
            ) : null}
          </div>
          <ChevronDownIcon className="mt-0.5 h-4 w-4 shrink-0 text-faint transition-transform duration-200 group-open:rotate-180" />
        </div>
      </summary>
      <div id={id} className="border-t border-hairline px-4 pt-3 pb-5">
        {children}
      </div>
    </details>
  )
}
