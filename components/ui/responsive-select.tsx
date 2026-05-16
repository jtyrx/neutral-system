'use client'

import * as React from 'react'

import {INPUT_WORKBENCH_FIELD_CLASS} from '@/components/ui/input.tsx'
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select.tsx'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.tsx'
import {useIsMobile} from '@/hooks/use-mobile'
import {cn} from '@/lib/utils'

const responsiveNativeSelectBase = cn(
  INPUT_WORKBENCH_FIELD_CLASS,
  'mb-0 appearance-none pr-8',
)

const responsiveSelectTriggerBase = cn(
  INPUT_WORKBENCH_FIELD_CLASS,
  'flex h-auto min-h-9 w-full min-w-0 justify-between gap-2',
  'py-2 pr-2.5 text-left font-normal whitespace-normal',
  '[&_svg]:shrink-0',
  '*:data-[slot=select-value]:min-w-0',
  '*:data-[slot=select-value]:flex-1',
  '*:data-[slot=select-value]:text-left',
)

export type ResponsiveSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

/**
 * Props for ResponsiveSelect. This component is controlled-only:
 * `value` and `onValueChange` are required; there is no `defaultValue` support.
 */
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

  const handleNativeChange = React.useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      onValueChange(event.target.value)
    },
    [onValueChange],
  )

  const handleValueChange = React.useCallback<
    NonNullable<React.ComponentProps<typeof Select>['onValueChange']>
  >(
    (next) => {
      if (next !== null && next !== undefined) {
        onValueChange(String(next))
      }
    },
    [onValueChange],
  )

  if (isMobile) {
    return (
      <NativeSelect
        id={id}
        value={value}
        disabled={disabled}
        className={cn(responsiveNativeSelectBase, className)}
        onChange={handleNativeChange}
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
      onValueChange={handleValueChange}
    >
      <SelectTrigger
        id={id}
        size="default"
        className={cn(responsiveSelectTriggerBase, className)}
      >
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

ResponsiveSelect.displayName = 'ResponsiveSelect'
