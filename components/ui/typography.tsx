import * as React from 'react'
import {cva, type VariantProps} from 'class-variance-authority'

import {cn} from '@/lib/utils'

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'scroll-m-20 font-heading text-4xl font-semibold tracking-tight text-balance',
      h2: 'scroll-m-20 font-heading text-3xl font-semibold tracking-tight text-balance',
      h3: 'scroll-m-20 font-heading text-2xl font-semibold tracking-tight',
      h4: 'scroll-m-20 font-heading text-xl font-semibold tracking-tight',
      p: 'leading-7 text-foreground [&:not(:first-child)]:mt-16',
      blockquote: 'mt-16 border-l-2 border-border pl-16 italic text-muted-foreground',
      list: 'my-16 ml-24 list-disc text-foreground [&>li]:mt-8',
      'inline-code':
        'relative rounded bg-muted px-4 py-2 font-mono text-sm font-medium text-foreground',
      lead: 'text-xl text-muted-foreground',
      large: 'text-lg font-semibold',
      small: 'text-sm font-medium leading-none',
      muted: 'text-sm text-muted-foreground',
    },
  },
  defaultVariants: {
    variant: 'p',
  },
})

type TypographyVariant = NonNullable<
  VariantProps<typeof typographyVariants>['variant']
>

const typographyDefaultElement: Record<TypographyVariant, React.ElementType> = {
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  p: 'p',
  blockquote: 'blockquote',
  list: 'ul',
  'inline-code': 'code',
  lead: 'p',
  large: 'p',
  small: 'small',
  muted: 'p',
}

type TypographyProps = React.ComponentProps<'p'> &
  VariantProps<typeof typographyVariants> & {
    as?: React.ElementType
  }

function Typography({
  className,
  variant = 'p',
  as,
  ...props
}: TypographyProps) {
  const Component = as ?? typographyDefaultElement[variant ?? 'p']
  return (
    <Component
      data-slot="typography"
      data-variant={variant}
      className={cn(typographyVariants({variant}), className)}
      {...props}
    />
  )
}
Typography.displayName = 'Typography'

export {Typography, typographyVariants}
export type {TypographyProps, TypographyVariant}
