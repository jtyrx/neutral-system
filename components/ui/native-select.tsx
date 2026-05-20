import * as React from 'react'

import {cn} from '@/lib/utils'
import {ChevronDownIcon} from 'lucide-react'

type NativeSelectProps = Omit<React.ComponentProps<'select'>, 'size'> & {
  size?: 'sm' | 'default'
}

const nativeSelectBase = cn(
  // base
  'h-32 min-h-0 w-full min-w-0 appearance-none rounded-lg border border-input bg-transparent',
  'py-4 pr-32 pl-10 text-sm outline-none select-none transition-colors',
  // text
  'placeholder:text-muted-foreground',
  'selection:bg-primary selection:text-primary-foreground',
  // focus
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50',
  // disabled
  'disabled:pointer-events-none disabled:cursor-not-allowed',
  // invalid
  'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20',
  // size variant
  'data-[size=sm]:h-28 data-[size=sm]:rounded-[min(var(--radius-md),10px)] data-[size=sm]:py-2',
  // dark
  'dark:bg-input/30 dark:hover:bg-input/50',
  'dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
)

function NativeSelect({
  className,
  size = 'default',
  ...props
}: NativeSelectProps) {
  return (
    <div
      className='relative w-full min-w-0 has-[select:disabled]:opacity-50'
      data-slot='native-select-wrapper'
      data-size={size}
    >
      <select
        data-slot='native-select'
        className={cn(nativeSelectBase, className)}
        {...props}
      />
      <ChevronDownIcon className='pointer-events-none absolute top-1/2 right-10 size-16 -translate-y-1/2 text-muted-foreground select-none' aria-hidden='true' data-slot='native-select-icon' />
    </div>
  )
}

NativeSelect.displayName = 'NativeSelect'

function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<'option'>) {
  return (
    <option
      data-slot='native-select-option'
      className={cn('bg-[Canvas] text-[CanvasText]', className)}
      {...props}
    />
  )
}

NativeSelectOption.displayName = 'NativeSelectOption'

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<'optgroup'>) {
  return (
    <optgroup
      data-slot='native-select-optgroup'
      className={cn('bg-[Canvas] text-[CanvasText] font-medium text-[0.7rem] uppercase tracking-widest', className)}
      {...props}
    />
  )
}

NativeSelectOptGroup.displayName = 'NativeSelectOptGroup'

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption }
export type { NativeSelectProps }
