'use client'

import type {ReactNode} from 'react'

type Props = {
  id: string
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: ReactNode
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
      className="group rounded-2xl border border-white/10 bg-black/20"
    >
      <summary className="cursor-pointer list-none px-4 py-3 sm:px-5 sm:py-4 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">{title}</p>
            {subtitle ? <p className="mt-1 text-xs text-white/45">{subtitle}</p> : null}
          </div>
          <span className="mt-0.5 text-white/35 transition group-open:rotate-180">▾</span>
        </div>
      </summary>
      <div id={id} className="border-t border-white/10 px-4 pb-5 pt-2 sm:px-5">
        {children}
      </div>
    </details>
  )
}
