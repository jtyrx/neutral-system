'use client'

import { ToggleGroup as ToggleGroupPrimitive } from '@base-ui/react/toggle-group'

import { cn } from '@/lib/utils'

export function ToggleGroup<Value extends string = string>(
  props: ToggleGroupPrimitive.Props<Value>,
) {
  const {className, ...rest} = props
  return (
    <ToggleGroupPrimitive
      {...rest}
      className={
        typeof className === 'function'
          ? (state) => cn('flex gap-1', className(state))
          : cn('flex gap-1', className)
      }
    />
  )
}
