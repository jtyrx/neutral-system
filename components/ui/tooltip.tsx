"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

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
  "children"
> &
  Pick<
    React.ComponentProps<typeof TooltipPrimitive.Positioner>,
    "side" | "align" | "sideOffset"
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
  side = "top",
  align = "center",
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
          className={cn(
            "z-50 inline-flex w-fit max-w-xs flex-row items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs leading-normal tracking-normal antialiased text-background has-data-[slot=kbd]:pr-1.5 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-(--transform-origin) **:data-[slot=kbd]:relative **:data-[slot=kbd]:isolate **:data-[slot=kbd]:z-50 **:data-[slot=kbd]:rounded-sm data-starting-style:animate-in data-starting-style:fade-in-0 data-starting-style:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            className,
          )}
          {...props}
        >
          <TooltipPrimitive.Arrow
            aria-hidden={true}
            className={cn(
              "z-0 text-foreground",
              // Rotations on the SVG only; no CSS transform on the positioned `Arrow` box (Floating UI).
              "data-[side=top]:[&>svg]:rotate-0",
              "data-[side=bottom]:[&>svg]:rotate-180",
              "data-[side=left]:[&>svg]:-rotate-90",
              "data-[side=right]:[&>svg]:rotate-90",
              "data-[side=inline-start]:[&>svg]:-rotate-90",
              "data-[side=inline-end]:[&>svg]:rotate-90",
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden={true}
              width={14}
              height={7}
              viewBox="0 0 14 7"
              className="block shrink-0 fill-current"
            >
              <path d="M0 0h14L7 7z" />
            </svg>
          </TooltipPrimitive.Arrow>
          <span className="relative z-1 min-w-0 shrink-0 whitespace-nowrap">{content}</span>
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
