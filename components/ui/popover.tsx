'use client'

import * as React from 'react'
import {Popover as PopoverPrimitive} from '@base-ui/react/popover'

import {cn} from '@/lib/utils'
import {
  floatingPopupOpenClose,
  floatingPopupSlideAllSides,
  floatingPopupTransitionDuration,
  popoverElevatedSurface,
} from './floating-popup-styles'

const popoverContentBase = cn(
  'z-50 flex origin-(--transform-origin) flex-col gap-10 p-10',
  'text-sm outline-hidden',
)

const popoverSizeClass: Record<'sm' | 'default' | 'lg' | 'auto', string> = {
  sm: 'w-240',
  default: 'w-288',
  lg: 'w-384',
  auto: '',
}

const popoverHeaderBase = 'flex flex-col gap-2'
const popoverTitleBase = 'font-normal'
const popoverDescriptionBase = 'text-muted-foreground'

function Popover({...props}: PopoverPrimitive.Root.Props) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  asChild,
  children,
  ...props
}: PopoverPrimitive.Trigger.Props & {
  asChild?: boolean
}) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      render={
        asChild && React.isValidElement(children)
          ? (children as React.ReactElement)
          : undefined
      }
      {...(asChild ? {} : {children})}
      {...props}
    />
  )
}

function PopoverContent({
  className,
  align = 'center',
  alignOffset = 0,
  side = 'bottom',
  sideOffset = 4,
  size = 'default',
  ...props
}: PopoverPrimitive.Popup.Props &
  Pick<
    PopoverPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset'
  > & {
    size?: 'sm' | 'default' | 'lg' | 'auto'
  }) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
        className="isolate z-50"
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          className={cn(
            popoverContentBase,
            popoverSizeClass[size],
            popoverElevatedSurface,
            floatingPopupTransitionDuration,
            floatingPopupSlideAllSides,
            floatingPopupOpenClose,
            className,
          )}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverHeader({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="popover-header"
      className={cn(popoverHeaderBase, className)}
      {...props}
    />
  )
}

function PopoverTitle({className, ...props}: PopoverPrimitive.Title.Props) {
  return (
    <PopoverPrimitive.Title
      data-slot="popover-title"
      className={cn(popoverTitleBase, className)}
      {...props}
    />
  )
}

function PopoverDescription({
  className,
  ...props
}: PopoverPrimitive.Description.Props) {
  return (
    <PopoverPrimitive.Description
      data-slot="popover-description"
      className={cn(popoverDescriptionBase, className)}
      {...props}
    />
  )
}

Popover.displayName = 'Popover'
PopoverTrigger.displayName = 'PopoverTrigger'
PopoverContent.displayName = 'PopoverContent'
PopoverHeader.displayName = 'PopoverHeader'
PopoverTitle.displayName = 'PopoverTitle'
PopoverDescription.displayName = 'PopoverDescription'

export {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
}
