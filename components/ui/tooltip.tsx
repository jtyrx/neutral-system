'use client'

import * as React from 'react'
import {Tooltip as TooltipPrimitive} from '@base-ui/react/tooltip'

import {cn} from '@/lib/utils'
import {
  tooltipPopupBodyPadding,
  tooltipPopupContentBaseClassName,
  tooltipPopupInnerSurface,
} from './floating-popup-styles'

const tooltipBodyBase = cn(
  'relative z-10 flex min-h-0 min-w-0 flex-1 flex-col',
  'items-stretch gap-6 whitespace-normal text-left',
  '[&_p]:m-0',
)

const tooltipTextBase = 'text-label leading-snug text-trim-both'

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider> & {
  delayDuration?: number
}) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger> & {
  asChild?: boolean
}) {
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      render={
        asChild && React.isValidElement(children)
          ? (children as React.ReactElement)
          : undefined
      }
      {...(asChild ? {} : { children })}
      {...props}
    />
  )
}

type TooltipContentProps = Omit<
  React.ComponentProps<typeof TooltipPrimitive.Popup>,
  'children'
> &
  Pick<
    React.ComponentProps<typeof TooltipPrimitive.Positioner>,
    'side' | 'align' | 'sideOffset'
  > & {
    children?: React.ReactNode
    /**
     * When true, wraps content with `Viewport` for animations when hopping between triggers.
     */
    enableViewportHopping?: boolean
  }

function TooltipContent({
  className,
  sideOffset = 0,
  side = 'top',
  align = 'center',
  children,
  enableViewportHopping = false,
  ...props
}: TooltipContentProps) {
  const content = enableViewportHopping ? (
    <TooltipPrimitive.Viewport>{children}</TooltipPrimitive.Viewport>
  ) : (
    children
  )

  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={cn(tooltipPopupContentBaseClassName, className)}
          {...props}
        >
          {/*
            Block wrapper (not <span>): callers often pass <p> and lists — phrasing-only <span>
            breaks HTML parsing (browser hoists <p>), destroying layout and hiding text in flex.
          */}
          {/* Inner surface is a separate element from the popup shell so the filter: drop-shadow stack composes correctly without clipping the caret. */}
          <div className={cn(tooltipPopupInnerSurface)}>
            <div
              className={cn(
                tooltipBodyBase,
                tooltipPopupBodyPadding,
              )}
            >
              <div className={tooltipTextBase}>{content}</div>
            </div>
          </div>
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

TooltipProvider.displayName = 'TooltipProvider'
Tooltip.displayName = 'Tooltip'
TooltipTrigger.displayName = 'TooltipTrigger'
TooltipContent.displayName = 'TooltipContent'

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
export type { TooltipContentProps }
