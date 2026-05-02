'use client'

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
import { cn } from '@/lib/utils'

const rootInset =
  'flex flex-wrap items-center gap-0.5 rounded-md border border-hairline bg-(--chrome-chip) p-0.5 outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35'

const Root = React.forwardRef(function ToolbarRoot(
  { className, ...props }: ToolbarRootProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <ToolbarPrimitive.Root
      ref={ref}
      className={
        typeof className === 'function'
          ? (state: ToolbarRootState) => cn(rootInset, className(state))
          : cn(rootInset, className)
      }
      {...props}
    />
  )
})

const buttonInset =
  '-my-px inline-flex size-8 shrink-0 items-center justify-center rounded-md text-subtle outline-none transition hover:bg-sidebar-border hover:text-default focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4'

const Button = React.forwardRef(function ToolbarButtonComp(
  { className, ...props }: ToolbarButtonProps,
  ref: React.Ref<HTMLButtonElement>,
) {
  return (
    <ToolbarPrimitive.Button
      ref={ref}
      className={
        typeof className === 'function'
          ? (state: ToolbarButtonState) => cn(buttonInset, className(state))
          : cn(buttonInset, className)
      }
      {...props}
    />
  )
})

const separatorInset = 'mx-0.5 h-5 shrink-0 bg-border data-[orientation=vertical]:w-px'

const Separator = React.forwardRef(function ToolbarSeparatorComp(
  { className, ...props }: ToolbarSeparatorProps,
  ref: React.Ref<HTMLDivElement>,
) {
  return (
    <ToolbarPrimitive.Separator
      ref={ref}
      className={
        typeof className === 'function'
          ? (state: ToolbarSeparatorState) => cn(separatorInset, className(state))
          : cn(separatorInset, className)
      }
      {...props}
    />
  )
})

const Toolbar = {
  Root,
  Button,
  Separator,
  Group: ToolbarPrimitive.Group,
  Link: ToolbarPrimitive.Link,
  Input: ToolbarPrimitive.Input,
}

export { Toolbar }
