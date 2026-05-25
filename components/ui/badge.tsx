import {mergeProps} from '@base-ui/react/merge-props'
import {useRender} from '@base-ui/react/use-render'
import {cva, type VariantProps} from 'class-variance-authority'
import {cn} from '@/lib/utils'

const badgeBase = cn(
  'group/badge inline-flex h-19 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-4xl border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&>svg]:pointer-events-none [&>svg]:size-32',
)

const badgeVariants = cva(badgeBase, {
  variants: {
    variant: {
      default: 'border border-hairline bg-raised text-default',
      subtle: 'border border-hairline bg-subtle text-subtle',
      solid: 'bg-inverse text-on',
      brand: 'bg-brand text-on',
      destructive:
        'bg-destructive/10 text-destructive focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:focus-visible:ring-destructive/40 [a]:hover:bg-destructive/20',
      outline:
        'border-border text-default [a]:hover:bg-muted [a]:hover:text-muted-foreground',
      ghost:
        'hover:bg-muted hover:text-default dark:hover:bg-muted/50',
      link: 'text-default underline-offset-4 hover:underline',
      disabled: 'pointer-events-none opacity-50',
    },
    size: {
      sm: 'px-8 py-2 text-nano',
      md: 'px-10 py-2 text-caption',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'sm',
  },
})

type BadgeProps = useRender.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants>

function Badge({
  className,
  variant = 'default',
  size = 'sm',
  render,
  ...props
}: BadgeProps) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>(
      {className: cn(badgeVariants({variant, size}), className)},
      props,
    ),
    render,
    state: {slot: 'badge', variant, size},
  })
}
Badge.displayName = 'Badge'

export {Badge, badgeVariants}
export type {BadgeProps}
