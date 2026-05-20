'use client'

/**
 * Base UI toolbar layout primitives (chip + controls). Rich tooltips with an integrated
 * caret use `components/ui/tooltip` and `components/ui/floating-popup-styles.ts`.
 */
import * as React from 'react'

import {
  Toolbar as ToolbarPrimitive,
  type ToolbarButtonProps as ToolbarButtonPropsBase,
  type ToolbarButtonState,
  type ToolbarRootProps,
  type ToolbarRootState,
  type ToolbarSeparatorProps,
  type ToolbarSeparatorState,
} from '@base-ui/react/toolbar'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const toolbarRootBase = cn(
  'flex flex-wrap items-center gap-2 rounded-md border border-hairline',
  'bg-chip p-2 outline-none',
  'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35',
)

const toolbarButtonBase = cn(
  '-my-px inline-flex shrink-0 items-center justify-center rounded-md',
  'text-subtle outline-none transition',
  'hover:bg-muted hover:text-default',
  'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35',
  'disabled:pointer-events-none disabled:opacity-45',
  '[&_svg]:pointer-events-none [&_svg]:size-16',
)

const toolbarButtonVariants = cva(toolbarButtonBase, {
  variants: {
    size: {
      sm: 'size-28',
      default: 'size-32',
      lg: 'size-36',
    },
  },
  defaultVariants: {size: 'default'},
})

const toolbarSeparatorBase =
  'mx-2 h-20 shrink-0 bg-border data-[orientation=vertical]:w-px'

function ToolbarRoot({
  className,
  ref,
  ...props
}: ToolbarRootProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ToolbarPrimitive.Root
      ref={ref}
      data-slot="toolbar"
      className={
        typeof className === 'function'
          ? (state: ToolbarRootState) => cn(toolbarRootBase, className(state))
          : cn(toolbarRootBase, className)
      }
      {...props}
    />
  )
}
ToolbarRoot.displayName = 'Toolbar.Root'

function ToolbarButton({
  className,
  size,
  ref,
  ...props
}: ToolbarButtonPropsBase & VariantProps<typeof toolbarButtonVariants> & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <ToolbarPrimitive.Button
      ref={ref}
      data-slot="toolbar-button"
      className={
        typeof className === 'function'
          ? (state: ToolbarButtonState) => cn(toolbarButtonVariants({size}), className(state))
          : cn(toolbarButtonVariants({size}), className)
      }
      {...props}
    />
  )
}
ToolbarButton.displayName = 'Toolbar.Button'

function ToolbarSeparator({
  className,
  ref,
  ...props
}: ToolbarSeparatorProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <ToolbarPrimitive.Separator
      ref={ref}
      data-slot="toolbar-separator"
      className={
        typeof className === 'function'
          ? (state: ToolbarSeparatorState) =>
              cn(toolbarSeparatorBase, className(state))
          : cn(toolbarSeparatorBase, className)
      }
      {...props}
    />
  )
}
ToolbarSeparator.displayName = 'Toolbar.Separator'

function ToolbarGroup(props: React.ComponentProps<typeof ToolbarPrimitive.Group>) {
  return <ToolbarPrimitive.Group data-slot="toolbar-group" {...props} />
}
ToolbarGroup.displayName = 'Toolbar.Group'

function ToolbarLink(props: React.ComponentProps<typeof ToolbarPrimitive.Link>) {
  return <ToolbarPrimitive.Link data-slot="toolbar-link" {...props} />
}
ToolbarLink.displayName = 'Toolbar.Link'

function ToolbarInput(props: React.ComponentProps<typeof ToolbarPrimitive.Input>) {
  return <ToolbarPrimitive.Input data-slot="toolbar-input" {...props} />
}
ToolbarInput.displayName = 'Toolbar.Input'

const Toolbar = Object.assign(
  {
    Root: ToolbarRoot,
    Button: ToolbarButton,
    Separator: ToolbarSeparator,
    Group: ToolbarGroup,
    Link: ToolbarLink,
    Input: ToolbarInput,
  },
  {displayName: 'Toolbar'},
)

export type ToolbarButtonProps = ToolbarButtonPropsBase &
  VariantProps<typeof toolbarButtonVariants> & {
    ref?: React.Ref<HTMLButtonElement>
  }

export {Toolbar, toolbarButtonVariants}
