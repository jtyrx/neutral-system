'use client'

import * as React from 'react'
import {Select as SelectPrimitive} from '@base-ui/react/select'

import {cn} from '@/lib/utils'
import {
  floatingPopupOpenClose,
  floatingPopupSlideAllSides,
  floatingPopupTransitionDuration,
  popoverElevatedSurface,
} from './floating-popup-styles'
import {ChevronDownIcon, CheckIcon, ChevronUpIcon} from 'lucide-react'

const Select = SelectPrimitive.Root

const selectTriggerBase = cn(
  // base
  'flex w-fit items-center justify-between gap-6 rounded-input border border-input bg-transparent',
  'py-8 pr-8 pl-10 text-sm whitespace-nowrap outline-none select-none transition-colors',
  // sizing
  'data-[size=default]:h-32 data-[size=sm]:h-28 data-[size=sm]:rounded-[min(var(--radius-md),10px)]',
  // placeholder
  'data-placeholder:text-muted-foreground',
  // value slot
  '*:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-6',
  // focus
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
  // disabled
  'disabled:cursor-not-allowed disabled:opacity-50',
  // invalid
  'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
  // svg
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-16",
  // dark
  'dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
)

const selectItemBase = cn(
  // base
  'relative flex w-full cursor-default items-center gap-6 rounded-select py-4 pr-6 pl-6',
  'text-sm outline-hidden select-none',
  // focus
  'focus:bg-accent focus:text-accent-foreground',
  // not-destructive text fix
  'not-data-[variant=destructive]:focus:**:text-accent-foreground',
  // disabled
  'data-disabled:pointer-events-none data-disabled:opacity-50',
  // svg
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-16",
)

function SelectGroup({className, ...props}: SelectPrimitive.Group.Props) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn('scroll-my-4 p-4', className)}
      {...props}
    />
  )
}

function SelectValue({className, ...props}: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn('flex flex-1 text-left', className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = 'default',
  children,
  ...props
}: SelectPrimitive.Trigger.Props & {
  size?: 'sm' | 'default'
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(selectTriggerBase, className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={
          <ChevronDownIcon className="pointer-events-none size-16 text-muted-foreground" />
        }
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  side = 'bottom',
  sideOffset = 4,
  align = 'center',
  alignOffset = 0,
  alignItemWithTrigger = true,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<
    SelectPrimitive.Positioner.Props,
    'align' | 'alignOffset' | 'side' | 'sideOffset' | 'alignItemWithTrigger'
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        side={side}
        sideOffset={sideOffset}
        align={align}
        alignOffset={alignOffset}
        alignItemWithTrigger={alignItemWithTrigger}
        className="isolate z-50"
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          data-align-trigger={alignItemWithTrigger}
          className={cn(
            'relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-144 origin-(--transform-origin) overflow-x-hidden overflow-y-auto',
            popoverElevatedSurface,
            floatingPopupTransitionDuration,
            'data-[align-trigger=true]:animate-none',
            floatingPopupSlideAllSides,
            floatingPopupOpenClose,
            className,
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List>{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({className, ...props}: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn('px-6 py-4 text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(selectItemBase, className)}
      {...props}
    >
      <SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-8 whitespace-nowrap">
        {children}
      </SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator
        render={
          <span className="pointer-events-none absolute right-8 flex size-16 items-center justify-center" />
        }
      >
        <CheckIcon className="pointer-events-none" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn('pointer-events-none -mx-4 my-4 h-px bg-border', className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-4 [&_svg:not([class*='size-'])]:size-16",
        className,
      )}
      {...props}
    >
      <ChevronUpIcon />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-4 [&_svg:not([class*='size-'])]:size-16",
        className,
      )}
      {...props}
    >
      <ChevronDownIcon />
    </SelectPrimitive.ScrollDownArrow>
  )
}

SelectGroup.displayName = 'SelectGroup'
SelectValue.displayName = 'SelectValue'
SelectTrigger.displayName = 'SelectTrigger'
SelectContent.displayName = 'SelectContent'
SelectLabel.displayName = 'SelectLabel'
SelectItem.displayName = 'SelectItem'
SelectSeparator.displayName = 'SelectSeparator'
SelectScrollUpButton.displayName = 'SelectScrollUpButton'
SelectScrollDownButton.displayName = 'SelectScrollDownButton'

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}

export type SelectScrollButtonProps = React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>

/** Full `@base-ui/react/select` namespace — use with Toolbar + `render` composition. */
export {SelectPrimitive as SelectPrimitives}
