'use client'

import * as React from 'react'
import {cva} from 'class-variance-authority'
import {Menu as MenuPrimitive} from '@base-ui/react/menu'

import {cn} from '@/lib/utils'
import {floatingPopupOpenClose} from '@/components/ui/floating-popup-styles'

// ─── Variant types ────────────────────────────────────────────────────────────

type DropdownMenuVariant = 'default' | 'panel'

const DropdownMenuVariantContext =
  React.createContext<DropdownMenuVariant>('default')

// ─── CVA definitions ─────────────────────────────────────────────────────────

const dropdownMenuContentVariants = cva(
  cn('z-50 overflow-hidden border shadow-md'),
  {
    variants: {
      variant: {
        default: cn(
          'min-w-128 rounded-md border-border bg-default p-4',
          'text-default',
        ),
        panel: cn(
          'min-w-[min(20rem,calc(100vw-2rem))]',
          'max-w-[min(22rem,calc(100vw-2rem))]',
          'rounded-2xl border-border/90 bg-popover p-0',
          'text-popover-foreground shadow-xl',
        ),
      },
    },
    defaultVariants: {variant: 'default'},
  },
)

const dropdownMenuLabelVariants = cva('', {
  variants: {
    variant: {
      default: 'px-8 py-6 text-xs font-medium text-muted-foreground',
      panel: 'px-12 pt-10 pb-4 text-xs font-semibold text-muted-foreground',
    },
  },
  defaultVariants: {variant: 'default'},
})

const dropdownMenuSeparatorVariants = cva('h-px', {
  variants: {
    variant: {
      default: 'my-4 bg-border',
      panel: 'mx-12 bg-border/80',
    },
  },
  defaultVariants: {variant: 'default'},
})

const dropdownMenuItemVariants = cva(
  cn(
    'relative flex cursor-default select-none items-center gap-8 rounded-sm',
    'text-sm transition-colors outline-none',
    'data-disabled:pointer-events-none data-disabled:opacity-50',
    '[&_svg]:pointer-events-none [&_svg]:shrink-0',
    '[&_svg:not([class*="size-"])]:size-16',
  ),
  {
    variants: {
      variant: {
        default: cn(
          'px-8 py-6',
          'focus:bg-accent focus:text-accent-foreground',
        ),
        panel: cn(
          'mb-2 cursor-pointer items-start justify-between gap-12 rounded-xl p-10',
          'text-left font-light text-foreground last:mb-0',
          'focus:bg-accent/80 data-[active=true]:bg-muted/50',
        ),
      },
    },
    defaultVariants: {variant: 'default'},
  },
)

const dropdownMenuListVariants = cva('', {
  variants: {
    variant: {
      default: '',
      panel: 'p-6',
    },
  },
  defaultVariants: {variant: 'default'},
})

// ─── Components ───────────────────────────────────────────────────────────────

function DropdownMenu({
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Root>) {
  return <MenuPrimitive.Root data-slot="dropdown-menu" {...props} />
}

function DropdownMenuTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Trigger> & {
  asChild?: boolean
}) {
  return (
    <MenuPrimitive.Trigger
      data-slot="dropdown-menu-trigger"
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

function DropdownMenuPortal({
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Portal>) {
  return <MenuPrimitive.Portal {...props} />
}

type DropdownMenuContentProps = React.ComponentProps<typeof MenuPrimitive.Popup> & {
  sideOffset?: number
  side?: React.ComponentProps<typeof MenuPrimitive.Positioner>['side']
  align?: React.ComponentProps<typeof MenuPrimitive.Positioner>['align']
  variant?: DropdownMenuVariant
}

function DropdownMenuContent({
  className,
  sideOffset = 12,
  side,
  align,
  variant = 'default',
  ...props
}: DropdownMenuContentProps) {
  return (
    <DropdownMenuVariantContext.Provider value={variant}>
      <DropdownMenuPortal>
        <MenuPrimitive.Positioner
          sideOffset={sideOffset}
          side={side}
          align={align}
        >
          <MenuPrimitive.Popup
            data-slot="dropdown-menu-content"
            data-variant={variant}
            className={cn(
              dropdownMenuContentVariants({variant}),
              floatingPopupOpenClose,
              className,
            )}
            {...props}
          />
        </MenuPrimitive.Positioner>
      </DropdownMenuPortal>
    </DropdownMenuVariantContext.Provider>
  )
}

type DropdownMenuItemProps = React.ComponentProps<typeof MenuPrimitive.Item> & {
  variant?: DropdownMenuVariant
}

function DropdownMenuItem({
  className,
  variant: variantProp,
  ...props
}: DropdownMenuItemProps) {
  const fromContext = React.useContext(DropdownMenuVariantContext)
  const variant = variantProp ?? fromContext
  return (
    <MenuPrimitive.Item
      data-slot="dropdown-menu-item"
      className={cn(dropdownMenuItemVariants({variant}), className)}
      {...props}
    />
  )
}

type DropdownMenuLabelProps = React.ComponentProps<'div'> & {
  variant?: DropdownMenuVariant
}

function DropdownMenuLabel({
  className,
  variant: variantProp,
  ...props
}: DropdownMenuLabelProps) {
  const fromContext = React.useContext(DropdownMenuVariantContext)
  const variant = variantProp ?? fromContext
  return (
    <div
      role="group"
      data-slot="dropdown-menu-label"
      className={cn(dropdownMenuLabelVariants({variant}), className)}
      {...props}
    />
  )
}

type DropdownMenuSeparatorProps = React.ComponentProps<typeof MenuPrimitive.Separator> & {
  variant?: DropdownMenuVariant
}

function DropdownMenuSeparator({
  className,
  variant: variantProp,
  ...props
}: DropdownMenuSeparatorProps) {
  const fromContext = React.useContext(DropdownMenuVariantContext)
  const variant = variantProp ?? fromContext
  return (
    <MenuPrimitive.Separator
      data-slot="dropdown-menu-separator"
      className={cn(dropdownMenuSeparatorVariants({variant}), className)}
      {...props}
    />
  )
}

type DropdownMenuListProps = React.ComponentProps<'div'> & {
  variant?: DropdownMenuVariant
}

function DropdownMenuList({
  className,
  variant: variantProp,
  ...props
}: DropdownMenuListProps) {
  const fromContext = React.useContext(DropdownMenuVariantContext)
  const variant = variantProp ?? fromContext
  return (
    <div
      data-slot="dropdown-menu-list"
      className={cn(dropdownMenuListVariants({variant}), className)}
      {...props}
    />
  )
}

function DropdownMenuGroup({
  ...props
}: React.ComponentProps<typeof MenuPrimitive.Group>) {
  return <MenuPrimitive.Group data-slot="dropdown-menu-group" {...props} />
}

DropdownMenu.displayName = 'DropdownMenu'
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger'
DropdownMenuPortal.displayName = 'DropdownMenuPortal'
DropdownMenuContent.displayName = 'DropdownMenuContent'
DropdownMenuItem.displayName = 'DropdownMenuItem'
DropdownMenuLabel.displayName = 'DropdownMenuLabel'
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator'
DropdownMenuList.displayName = 'DropdownMenuList'
DropdownMenuGroup.displayName = 'DropdownMenuGroup'

export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuList,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
}
