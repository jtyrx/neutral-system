'use client'

import * as React from 'react'
import {CheckboxGroup as CheckboxGroupPrimitive} from '@base-ui/react/checkbox-group'

import {cn} from '@/lib/utils'

function CheckboxGroup({
  className,
  ...props
}: CheckboxGroupPrimitive.Props) {
  return (
    <CheckboxGroupPrimitive
      data-slot="checkbox-group"
      className={cn('flex flex-col gap-8', className)}
      {...props}
    />
  )
}
CheckboxGroup.displayName = 'CheckboxGroup'

export {CheckboxGroup}
export type CheckboxGroupProps = CheckboxGroupPrimitive.Props
