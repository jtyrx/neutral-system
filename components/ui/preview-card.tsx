'use client'

import * as React from 'react'
import { PreviewCard as PreviewCardPrimitive } from '@base-ui/react/preview-card'

import { cn } from '@/lib/utils'

function PreviewCardRoot({
  ...props
}: React.ComponentProps<typeof PreviewCardPrimitive.Root>) {
  return <PreviewCardPrimitive.Root data-slot="preview-card" {...props} />
}

function PreviewCardTrigger({
  render,
  children,
  ...props
}: React.ComponentProps<typeof PreviewCardPrimitive.Trigger>) {
  return (
    <PreviewCardPrimitive.Trigger
      data-slot="preview-card-trigger"
      render={render}
      {...(render ? {} : { children })}
      {...props}
    />
  )
}

function PreviewCardPortal({
  ...props
}: React.ComponentProps<typeof PreviewCardPrimitive.Portal>) {
  return <PreviewCardPrimitive.Portal data-slot="preview-card-portal" {...props} />
}

function PreviewCardPositioner({
  className,
  ...props
}: React.ComponentProps<typeof PreviewCardPrimitive.Positioner>) {
  return (
    <PreviewCardPrimitive.Positioner
      data-slot="preview-card-positioner"
      className={className}
      {...props}
    />
  )
}

function PreviewCardPopup({
  className,
  ...props
}: React.ComponentProps<typeof PreviewCardPrimitive.Popup>) {
  return (
    <PreviewCardPrimitive.Popup
      data-slot="preview-card-popup"
      className={className}
      {...props}
    />
  )
}

function PreviewCardViewport({
  ...props
}: React.ComponentProps<typeof PreviewCardPrimitive.Viewport>) {
  return (
    <PreviewCardPrimitive.Viewport data-slot="preview-card-viewport" {...props} />
  )
}

function PreviewCardArrow({
  className,
  ...props
}: React.ComponentProps<typeof PreviewCardPrimitive.Arrow>) {
  return (
    <PreviewCardPrimitive.Arrow
      data-slot="preview-card-arrow"
      className={className}
      {...props}
    />
  )
}

type PreviewCardContentProps = Omit<
  React.ComponentProps<typeof PreviewCardPrimitive.Popup>,
  'children'
> &
  Pick<
    React.ComponentProps<typeof PreviewCardPrimitive.Positioner>,
    'side' | 'align' | 'sideOffset'
  > & {
    children?: React.ReactNode
  }

function PreviewCardContent({
  className,
  sideOffset = 8,
  side = 'bottom',
  align = 'start',
  children,
  ...popupProps
}: PreviewCardContentProps) {
  return (
    <PreviewCardPrimitive.Portal>
      <PreviewCardPrimitive.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
      >
        <PreviewCardPrimitive.Popup
          data-slot="preview-card-content"
          className={cn(
            'z-50 max-w-md rounded-sm border border-hairline bg-default p-4 text-default shadow-md outline-none data-[starting-style]:animate-in data-[starting-style]:fade-in-0 data-[starting-style]:zoom-in-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
            className,
          )}
          {...popupProps}
        >
          <PreviewCardPrimitive.Viewport>{children}</PreviewCardPrimitive.Viewport>
        </PreviewCardPrimitive.Popup>
      </PreviewCardPrimitive.Positioner>
    </PreviewCardPrimitive.Portal>
  )
}

type AdditionalInfoPreviewCardProps = Pick<
  React.ComponentProps<typeof PreviewCardPrimitive.Trigger>,
  'delay' | 'closeDelay'
> &
  Pick<
    PreviewCardContentProps,
    'side' | 'align' | 'sideOffset'
  > & {
    /** Short label shown inline in the control group header (sky accent link). */
    additionalInfo: string
    triggerClassName?: string
    contentClassName?: string
    children: React.ReactNode
  }

/**
 * Preview card wired for collapsible section headers: inline accent trigger + portaled popup.
 * Stops propagation so activating the trigger does not toggle a parent `<details>`.
 */
function AdditionalInfoPreviewCard({
  additionalInfo,
  delay = 200,
  closeDelay = 150,
  side = 'bottom',
  align = 'start',
  sideOffset = 8,
  triggerClassName,
  contentClassName,
  children,
}: AdditionalInfoPreviewCardProps) {
  return (
    <PreviewCardRoot>
      <PreviewCardTrigger
        delay={delay}
        closeDelay={closeDelay}
        render={
          <button
            type="button"
            className={cn(
              'inline cursor-pointer border-0 bg-transparent p-0 text-xs font-medium text-(--ns-chrome-sky-text) underline decoration-transparent underline-offset-2 transition hover:decoration-current',
              triggerClassName,
            )}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {additionalInfo}
          </button>
        }
      />
      <PreviewCardContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={contentClassName}
      >
        {children}
      </PreviewCardContent>
    </PreviewCardRoot>
  )
}

export {
  PreviewCardRoot,
  PreviewCardTrigger,
  PreviewCardPortal,
  PreviewCardPositioner,
  PreviewCardPopup,
  PreviewCardViewport,
  PreviewCardArrow,
  PreviewCardContent,
  AdditionalInfoPreviewCard,
}
