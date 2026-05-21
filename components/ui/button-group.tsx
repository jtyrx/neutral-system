import * as React from 'react'
import {useRender} from '@base-ui/react/use-render'
import {cva, type VariantProps} from 'class-variance-authority'

import {cn} from '@/lib/utils'

// ─── Orientation context ──────────────────────────────────────────────────────

type ButtonGroupOrientation = 'horizontal' | 'vertical'

const ButtonGroupOrientationContext =
  React.createContext<ButtonGroupOrientation>('horizontal')

// ─── ButtonGroup ──────────────────────────────────────────────────────────────

const buttonGroupVariants = cva('btn-group-sys flex w-fit items-stretch', {
  variants: {
    orientation: {
      horizontal: 'flex-row',
      vertical: 'flex-col',
    },
  },
  defaultVariants: {orientation: 'horizontal'},
})

type ButtonGroupProps = React.ComponentProps<'div'> &
  VariantProps<typeof buttonGroupVariants>

function ButtonGroup({
  className,
  orientation = 'horizontal',
  children,
  ...props
}: ButtonGroupProps) {
  return (
    <ButtonGroupOrientationContext.Provider value={orientation ?? 'horizontal'}>
      <div
        role="group"
        data-slot="button-group"
        data-orientation={orientation ?? 'horizontal'}
        className={cn(buttonGroupVariants({orientation}), className)}
        {...props}
      >
        {children}
      </div>
    </ButtonGroupOrientationContext.Provider>
  )
}
ButtonGroup.displayName = 'ButtonGroup'

// ─── ButtonGroupSeparator ─────────────────────────────────────────────────────

function ButtonGroupSeparator({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const orientation = React.useContext(ButtonGroupOrientationContext)
  return (
    <div
      data-slot="button-group-separator"
      aria-hidden
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'w-px self-stretch' : 'h-px w-full',
        className,
      )}
      {...props}
    />
  )
}
ButtonGroupSeparator.displayName = 'ButtonGroupSeparator'

// ─── ButtonGroupText ──────────────────────────────────────────────────────────

type ButtonGroupTextProps = React.ComponentProps<'span'> & {asChild?: boolean}

function ButtonGroupText({
  className,
  asChild = false,
  children,
  ref,
  ...props
}: ButtonGroupTextProps) {
  return useRender({
    defaultTagName: 'span',
    ref,
    render: asChild
      ? React.Children.only(children as React.ReactElement)
      : undefined,
    props: {
      ...props,
      ...(!asChild ? {children} : {}),
      'data-slot': 'button-group-text',
      className: cn(
        'inline-flex items-center px-8 text-sm text-muted-foreground',
        className,
      ),
    },
  }) as React.ReactElement
}
ButtonGroupText.displayName = 'ButtonGroupText'

// ─── Compound export ──────────────────────────────────────────────────────────

const ButtonGroupWithParts = Object.assign(ButtonGroup, {
  Separator: ButtonGroupSeparator,
  Text: ButtonGroupText,
})

export {ButtonGroupWithParts as ButtonGroup, ButtonGroupSeparator, ButtonGroupText}
export type {ButtonGroupProps, ButtonGroupTextProps}
