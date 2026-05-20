import * as React from 'react'
import {useRender} from '@base-ui/react/use-render'

import {cn} from '@/lib/utils'

const cardBase = cn(
  'group/card flex flex-col gap-16 overflow-hidden rounded-xl bg-card py-16',
  'text-sm text-card-foreground ring-1 ring-foreground/10',
  'has-data-[slot=card-footer]:pb-0 has-[>img:first-child]:pt-0',
  'data-[size=sm]:gap-12 data-[size=sm]:py-12',
  'data-[size=sm]:has-data-[slot=card-footer]:pb-0',
)

const cardHeaderBase = cn(
  'group/card-header @container/card-header grid auto-rows-min items-start gap-4',
  'rounded-t-xl px-16 group-data-[size=sm]/card:px-12',
  'has-data-[slot=card-action]:grid-cols-[1fr_auto]',
  'has-data-[slot=card-description]:grid-rows-[auto_auto]',
  '[.border-b]:pb-16 group-data-[size=sm]/card:[.border-b]:pb-12',
)

const cardTitleBase =
  'font-heading text-base leading-snug font-medium group-data-[size=sm]/card:text-sm'

const cardActionBase =
  'col-start-2 row-span-2 row-start-1 self-start justify-self-end'

const cardContentBase = 'px-16 group-data-[size=sm]/card:px-12'

const cardFooterBase = cn(
  'flex items-center rounded-b-xl border-t bg-muted/50 p-16',
  'group-data-[size=sm]/card:p-12',
)

function Card({
  className,
  size = 'default',
  ...props
}: React.ComponentProps<'div'> & {size?: 'default' | 'sm'}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(cardBase, className)}
      {...props}
    />
  )
}

function CardHeader({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(cardHeaderBase, className)}
      {...props}
    />
  )
}

function CardTitle({
  className,
  asChild = false,
  children,
  ref,
  ...props
}: React.ComponentProps<'div'> & {asChild?: boolean, ref?: React.Ref<HTMLDivElement>}) {
  return useRender({
    defaultTagName: 'div',
    ref,
    render: asChild
      ? React.Children.only(children as React.ReactElement)
      : undefined,
    props: {
      ...props,
      ...(!asChild ? {children} : {}),
      'data-slot': 'card-title',
      className: cn(cardTitleBase, className),
    },
  }) as React.ReactElement
}

function CardDescription({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function CardAction({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn(cardActionBase, className)}
      {...props}
    />
  )
}

function CardContent({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn(cardContentBase, className)}
      {...props}
    />
  )
}

function CardFooter({className, ...props}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn(cardFooterBase, className)}
      {...props}
    />
  )
}

type CardImagePosition = 'top' | 'bottom' | 'standalone'

type CardImageProps = React.ComponentProps<'img'> & {
  /** Controls which corners get rounded. `top` rounds top corners, `bottom` rounds bottom corners, `standalone` rounds all corners. */
  position?: CardImagePosition
}

function CardImage({className, position = 'top', ...props}: CardImageProps) {
  return (
    <img
      data-slot="card-image"
      data-position={position}
      className={cn(
        'w-full object-cover',
        position === 'top' && 'rounded-t-xl',
        position === 'bottom' && 'rounded-b-xl',
        position === 'standalone' && 'rounded-xl',
        className,
      )}
      {...props}
    />
  )
}
CardImage.displayName = 'CardImage'

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardTitle.displayName = 'CardTitle'
CardDescription.displayName = 'CardDescription'
CardAction.displayName = 'CardAction'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardImage,
  CardAction,
  CardDescription,
  CardContent,
}
