'use client'

import * as React from 'react'
import { Tooltip as TooltipPrimitive } from '@base-ui/react/tooltip'

import { cn } from '@/lib/utils'
import {
  tooltipPopupBodyPadding,
  tooltipPopupContentBaseClassName,
  tooltipPopupInnerSurface,
} from '@/components/ui/floating-popup-styles'

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
     * Default tooltips omit this — it enables extra positioning middleware.
     */
    withViewport?: boolean
  }

function TooltipContent({
  className,
  sideOffset = 0,
  side = 'top',
  align = 'center',
  children,
  withViewport = false,
  ...props
}: TooltipContentProps) {
  const content = withViewport ? (
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
          {/* <TooltipPrimitive.Arrow
            aria-hidden={true}
            className={cn(
              'z-1 shrink-0',
              'data-[side=top]:bottom-0 data-[side=top]:translate-y-[calc(50%-1px)]',
              'data-[side=bottom]:top-0 data-[side=bottom]:translate-y-[calc(-50%+1px)]',
              'data-[side=left]:right-0 data-[side=left]:translate-x-[calc(50%-1px)]',
              'data-[side=right]:left-0 data-[side=right]:translate-x-[calc(-50%+1px)]',
              'data-[side=inline-start]:right-0 data-[side=inline-start]:translate-x-[calc(50%-1px)]',
              'data-[side=inline-end]:left-0 data-[side=inline-end]:translate-x-[calc(-50%+1px)]',
              '[&>div]:box-border [&>div]:size-2.5 [&>div]:shrink-0 [&>div]:rotate-45 [&>div]:bg-popover',
            )}
          >
            <div aria-hidden={true} />
          </TooltipPrimitive.Arrow> */}
          {/*
            Block wrapper (not <span>): callers often pass <p> and lists — phrasing-only <span>
            breaks HTML parsing (browser hoists <p>), destroying layout and hiding text in flex.
          */}
          <div className={cn(tooltipPopupInnerSurface)}>
            <div
              className={cn(
                'relative z-2 flex min-h-0 min-w-0 flex-1 flex-col gap-1.5 items-stretch whitespace-normal text-left [&_p]:m-0',
                tooltipPopupBodyPadding,
              )}
            >

              <div className="text-label leading-snug text-trim-both">{content}</div>
            </div>
          </div>
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
