'use client'

/**
 * Base UI toolbar layout primitives (chip + controls). Rich tooltips with an integrated
 * caret use `components/ui/tooltip` and `components/ui/floating-popup-styles.ts`.
 */
import * as React from 'react'

import {
  Toolbar as ToolbarPrimitive,
  type ToolbarButtonProps,
  type ToolbarButtonState,
  type ToolbarRootProps,
  type ToolbarRootState,
  type ToolbarSeparatorProps,
  type ToolbarSeparatorState,
} from '@base-ui/react/toolbar'
import {cn} from '@/lib/utils'

const toolbarRootBase = cn(
  'flex flex-wrap items-center gap-0.5 rounded-md border border-hairline',
  'bg-(--chrome-chip) p-0.5 outline-none',
  'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35',
)

const toolbarButtonBase = cn(
  '-my-px inline-flex size-8 shrink-0 items-center justify-center rounded-md',
  'text-subtle outline-none transition',
  'hover:bg-muted hover:text-default',
  'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35',
  'disabled:pointer-events-none disabled:opacity-45',
  '[&_svg]:pointer-events-none [&_svg]:size-4',
)

const toolbarSeparatorBase =
  'mx-0.5 h-5 shrink-0 bg-border data-[orientation=vertical]:w-px'

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
  ref,
  ...props
}: ToolbarButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  return (
    <ToolbarPrimitive.Button
      ref={ref}
      data-slot="toolbar-button"
      className={
        typeof className === 'function'
          ? (state: ToolbarButtonState) => cn(toolbarButtonBase, className(state))
          : cn(toolbarButtonBase, className)
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

const Toolbar = {
  Root: ToolbarRoot,
  Button: ToolbarButton,
  Separator: ToolbarSeparator,
  Group: ToolbarPrimitive.Group,
  Link: ToolbarPrimitive.Link,
  Input: ToolbarPrimitive.Input,
}

export { Toolbar }
