'use client'

import * as React from 'react'
import {useButton} from '@base-ui/react/internals/use-button'
import {useRender} from '@base-ui/react/use-render'
import {cva, type VariantProps} from 'class-variance-authority'

import {ChevronDown} from 'lucide-react'

import {cn} from '@/lib/utils'

const buttonBase = cn(
  'group/button inline-flex shrink-0 items-center justify-center',
  'rounded-input border border-transparent bg-clip-padding',
  'text-sm font-medium whitespace-nowrap',
  'transition-all outline-none select-none',
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
  // Exclude popups and already-pressed toggles from the nudge — pressing an
  // active toggle would double-fire the translate and look broken.
  'active:not-aria-[haspopup]:not-aria-pressed:translate-y-px',
  'disabled:pointer-events-none disabled:opacity-50',
  'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
  'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
  "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
)

const buttonVariants = cva(buttonBase, {
  variants: {
    variant: {
      default: 'bg-primary text-primary-foreground hover:bg-primary/80',
      outline: cn(
        'bg-background hover:bg-muted hover:text-foreground',
        'aria-expanded:bg-muted aria-expanded:text-foreground',
        'aria-pressed:bg-muted aria-pressed:text-foreground',
        'dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
      ),
      secondary: cn(
        'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        'aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
        'aria-pressed:bg-secondary aria-pressed:text-secondary-foreground',
      ),
      ghost: cn(
        'hover:bg-muted hover:text-foreground',
        'aria-expanded:bg-muted aria-expanded:text-foreground',
        'aria-pressed:bg-muted aria-pressed:text-foreground',
        'dark:hover:bg-muted/50',
      ),
      destructive: cn(
        'bg-destructive/10 text-destructive hover:bg-destructive/20',
        'focus-visible:border-destructive/40 focus-visible:ring-destructive/20',
        'dark:bg-destructive/20 dark:hover:bg-destructive/30',
        'dark:focus-visible:ring-destructive/40',
      ),
      link: 'text-primary underline-offset-4 hover:underline',
    },
    size: {
      default: cn(
        'h-8 gap-1.5 px-2.5',
        'has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
      ),
      xs: cn(
        'h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs',
        'in-data-[slot=button-group]:rounded-input',
        'has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
        "[&_svg:not([class*='size-'])]:size-3",
      ),
      sm: cn(
        'h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem]',
        'in-data-[slot=button-group]:rounded-input',
        'has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
        "[&_svg:not([class*='size-'])]:size-3.5",
      ),
      lg: cn(
        'h-9 gap-1.5 px-2.5',
        'has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
      ),
      icon: 'size-8.25',
      'icon-xs': cn(
        'size-6 rounded-[min(var(--radius-md),10px)]',
        'in-data-[slot=button-group]:rounded-input',
        "[&_svg:not([class*='size-'])]:size-3",
      ),
      'icon-sm': cn(
        'size-7 rounded-[min(var(--radius-md),12px)]',
        'in-data-[slot=button-group]:rounded-input',
      ),
      'icon-lg': 'size-9',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
})

type ButtonVariants = VariantProps<typeof buttonVariants>

type ButtonProps = React.ComponentProps<'button'> &
  ButtonVariants & {
    asChild?: boolean
    /** Passed to Base UI `useButton` — focusable when `disabled` (e.g. toolbar composite). */
    focusableWhenDisabled?: boolean
    /**
     * When `true` (default), native `<button>` semantics. When `false`, `role="button"` behavior;
     * pair with `asChild` + a non-`<button>` host (e.g. `Link`).
     */
    nativeButton?: boolean
  }

function Button({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  nativeButton = true,
  disabled,
  focusableWhenDisabled,
  ref,
  children,
  ...rest
}: ButtonProps) {
  const {getButtonProps, buttonRef} = useButton({
    disabled: disabled ?? false,
    focusableWhenDisabled,
    native: nativeButton,
  })

  return useRender({
    defaultTagName: 'button',
    ref: ref != null ? [ref, buttonRef] : buttonRef,
    render: asChild
      ? React.Children.only(children as React.ReactElement)
      : undefined,
    props: getButtonProps({
      ...rest,
      ...(!asChild ? {children} : {}),
      disabled,
      'data-slot': 'button',
      'data-variant': variant,
      'data-size': size,
      className: cn(buttonVariants({variant, size}), className),
    }),
  }) as React.ReactElement
}
Button.displayName = 'Button'

export type ButtonLinkProps = React.ComponentProps<'a'> &
  ButtonVariants & {
    /** Slot a Next.js `<Link>` or router anchor. Single valid element child. */
    asChild?: boolean
  }

/**
 * Anchor-flavored button variant. Renders `<a>` (or `asChild` host) with button styling.
 * Note: Does not use Base UI `useButton` — `disabled` is a visual-only attribute here.
 * For interactive disabled state management, use `<Button asChild>` with a `Link` component.
 */
function ButtonLink({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  ref,
  children,
  ...rest
}: ButtonLinkProps) {
  return useRender({
    defaultTagName: 'a',
    ref,
    render: asChild
      ? React.Children.only(children as React.ReactElement)
      : undefined,
    props: {
      ...rest,
      ...(!asChild ? {children} : {}),
      'data-slot': 'button',
      'data-variant': variant,
      'data-size': size,
      className: cn(buttonVariants({variant, size}), className),
    },
  }) as React.ReactElement
}
ButtonLink.displayName = 'ButtonLink'

type MenuTriggerButtonProps = Omit<ButtonProps, 'variant' | 'size'> & {
  label: React.ReactNode
  value?: React.ReactNode
}

function MenuTriggerButton({label, value, className, ...props}: MenuTriggerButtonProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn('gap-1.5 font-light', className)}
      {...props}
    >
      <span className="text-subtle">{label}</span>
      {value != null && <span className="font-medium text-default">{value}</span>}
      <ChevronDown className="size-3 shrink-0 text-muted-foreground" aria-hidden />
    </Button>
  )
}
MenuTriggerButton.displayName = 'Button.MenuTrigger'

const ButtonWithMenuTrigger = Object.assign(Button, {MenuTrigger: MenuTriggerButton})

export {ButtonWithMenuTrigger as Button, ButtonLink, MenuTriggerButton as ButtonMenuTrigger, buttonVariants}
export type {ButtonProps, MenuTriggerButtonProps as ButtonMenuTriggerProps}
