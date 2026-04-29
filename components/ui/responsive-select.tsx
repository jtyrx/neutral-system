'use client'

import * as React from 'react'

import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useIsMobile } from '@/hooks/use-mobile'
import { cn } from '@/lib/utils'

export type ResponsiveSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type ResponsiveSelectProps = {
  id?: string
  value: string
  options: ResponsiveSelectOption[]
  onValueChange: (value: string) => void
  className?: string
  disabled?: boolean
}

export function ResponsiveSelect({
  id,
  value,
  options,
  onValueChange,
  className,
  disabled,
}: ResponsiveSelectProps) {
  const isMobile = useIsMobile()

  const items = React.useMemo(
    () => options.map((o) => ({ label: o.label, value: o.value })),
    [options],
  )

  const mergedSelectClassName = cn('ns-input appearance-none pr-8 mb-0', className)

  const mergedTriggerClassName = cn(
    'ns-input flex h-auto min-h-9 w-full min-w-0 justify-between gap-2 py-2 pr-2.5 text-left font-normal whitespace-normal [&_svg]:shrink-0',
    '*:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:text-left',
    className,
  )

  if (isMobile) {
    return (
      <NativeSelect
        id={id}
        value={value}
        disabled={disabled}
        className={mergedSelectClassName}
        onChange={(e) => onValueChange(e.target.value)}
      >
        {options.map((o) => (
          <NativeSelectOption key={o.value} value={o.value} disabled={o.disabled}>
            {o.label}
          </NativeSelectOption>
        ))}
      </NativeSelect>
    )
  }

  return (
    <Select
      disabled={disabled}
      items={items}
      value={value}
      onValueChange={(next) => {
        if (next !== null && next !== undefined) {
          onValueChange(String(next))
        }
      }}
    >
      <SelectTrigger id={id} size="default" className={mergedTriggerClassName}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent alignItemWithTrigger>
        <SelectGroup>
          {options.map((o) => (
            <SelectItem key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}
