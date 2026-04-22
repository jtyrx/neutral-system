'use client'

import type {ReactNode} from 'react'

type Props = {
  id: string
  title: string
  subtitle?: string
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
  defaultOpen = true,
  children,
}: Props) {
  return (
    <details
      open={defaultOpen}
      className="group rounded-sm border border-[var(--ns-hairline)] bg-[var(--ns-surface-default)]"
    >
      <summary className="cursor-pointer list-none px-4 py-3 sm:px-4 sm:py-3 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold tracking-tight text-[var(--ns-text)]">{title}</p>
            {subtitle ? <p className="mt-1 text-xs text-[var(--ns-text-muted)]">{subtitle}</p> : null}
          </div>
          <ChevronDownIcon className="mt-0.5 h-4 w-4 shrink-0 text-[var(--ns-text-faint)] transition-transform duration-200 group-open:rotate-180" />
        </div>
      </summary>
      <div id={id} className="border-t border-[var(--ns-hairline)] px-4 pb-5 pt-2 sm:px-5">
        {children}
      </div>
    </details>
  )
}
