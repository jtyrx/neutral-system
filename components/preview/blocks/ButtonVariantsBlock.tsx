import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {Button} from '@/components/ui/button.tsx'
import {Loader2} from 'lucide-react'

const BUTTON_VARIANTS = [
  {value: 'default', label: 'Default'},
  {value: 'secondary', label: 'Secondary'},
  {value: 'outline', label: 'Outline'},
  {value: 'ghost', label: 'Ghost'},
  {value: 'destructive', label: 'Destructive'},
  {value: 'link', label: 'Link'},
] as const

const BUTTON_SIZES = [
  {value: 'xs', label: 'XS'},
  {value: 'sm', label: 'SM'},
  {value: 'md', label: 'MD'},
  {value: 'lg', label: 'LG'},
] as const

const BUTTON_STATE_LABELS = ['Rest', 'Focus', 'Disabled', 'Loading'] as const

export function ButtonVariantsBlock(_props: BlockCaseProps) {
  return (
    <div className="overflow-x-auto rounded-md bg-(--color-surface-default) p-8">
      <div className="min-w-4xl space-y-4">
        <div className="grid grid-cols-[5rem_3rem_repeat(4,minmax(7rem,1fr))] gap-8 border-b border-hairline pb-6">
          <div />
          <span className="text-center text-micro font-medium uppercase tracking-wide text-disabled">
            Size
          </span>
          {BUTTON_STATE_LABELS.map((col) => (
            <span key={col} className="text-center text-micro font-medium uppercase tracking-wide text-disabled">
              {col}
            </span>
          ))}
        </div>
        {BUTTON_VARIANTS.map(({value, label}) => (
          <div key={value} className="border-b border-hairline py-6 last:border-b-0">
            {BUTTON_SIZES.map(({value: size, label: sizeLabel}, sizeIndex) => (
              <div key={size} className="grid grid-cols-[5rem_3rem_repeat(4,minmax(7rem,1fr))] items-center gap-8 py-6">
                <span className="font-mono text-micro text-muted">{sizeIndex === 0 ? label : ''}</span>
                <span className="text-center font-mono text-micro text-disabled">{sizeLabel}</span>
                <div className="flex justify-center">
                  <Button variant={value} size={size}>{label}</Button>
                </div>
                <div className="flex justify-center">
                  <Button
                    variant={value}
                    size={size}
                    className={value === 'destructive' ? 'border-destructive/40 ring-3 ring-destructive/20' : 'border-ring ring-3 ring-ring/50'}
                    tabIndex={-1}
                  >
                    {label}
                  </Button>
                </div>
                <div className="flex justify-center">
                  <Button variant={value} size={size} disabled>{label}</Button>
                </div>
                <div className="flex justify-center">
                  <Button variant={value} size={size} disabled>
                    <Loader2 className="animate-spin" />
                    {label}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
ButtonVariantsBlock.displayName = 'ButtonVariantsBlock'
