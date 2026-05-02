'use client'

import type {
  ForwardRefExoticComponent,
  ReactNode,
  RefAttributes,
  SVGProps,
} from 'react'

import { ChevronDown } from 'lucide-react'

/**
 * Lucide React icon component (`forwardRef` SVG), e.g. `Blend` from `lucide-react`.
 * Matches Lucide’s internal icon component shape.
 */
export type CollapsibleControlGroupIcon = ForwardRefExoticComponent<
  Omit<SVGProps<SVGSVGElement>, 'ref'> & {
    size?: string | number
    absoluteStrokeWidth?: boolean
  } & RefAttributes<SVGSVGElement>
>

type Props = {
  id: string
  title: string
  /** Optional Lucide icon beside the title (decorative; title remains the accessible name). */
  icon?: CollapsibleControlGroupIcon
  /**
   * Optional summary body below the title (helper text, preview cards, etc.).
   * Host owns composition; this wrapper only provides placement and rhythm.
   */
  additionalInfo?: ReactNode
  defaultOpen?: boolean
  children: ReactNode
}

// function ChevronDownIcon({className}: {className?: string}) {
//   return (
//     <svg
//       className={className}
//       viewBox="0 0 24 24"
//       aria-hidden
//       fill="none"
//       stroke="currentColor"
//       strokeWidth={1.75}
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     >
//       <path d="M6 9l6 6 6-6" />
//     </svg>
//   )
// }

/** Collapsible region for grouped builder controls (Scale / Contrast / Mapping). */
export function CollapsibleControlGroup({
  id,
  title,
  icon: Icon,
  additionalInfo,
  defaultOpen = true,
  children,
}: Props) {
  return (
    <details
      open={defaultOpen}
      className="ns-collapsible-details group origin-top scale-[0.997] rounded-sm border border-hairline bg-subtle motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out open:scale-100"
    >
      <summary className="cursor-pointer list-none px-4 py-3 sm:px-4 sm:py-3 [&::-webkit-details-marker]:hidden">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 flex-1 items-start gap-2">
            {Icon ? (
              <Icon
                className="mt-0.5 size-4 shrink-0 text-muted"
                aria-hidden
              />
            ) : null}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold tracking-tight text-default">
                {title}
              </p>
              {additionalInfo ? (
                <div className="mt-1 space-y-2 text-xs text-muted">
                  {additionalInfo}
                </div>
              ) : null}
            </div>
          </div>
          <ChevronDown className="mt-0.5 size-4 shrink-0 text-disabled motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out group-open:rotate-180" />
        </div>
      </summary>
      <div id={id} className=" border-hairline px-4 pt-3 pb-5">
        {children}
      </div>
    </details>
  )
}
