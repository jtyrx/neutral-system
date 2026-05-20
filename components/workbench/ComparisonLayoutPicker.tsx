'use client'

import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group.tsx'
import {cn} from '@/lib/cn'
import type {ComparisonLayout} from '@/components/preview/PreviewComparison'

const COMPARISON_LAYOUT_OPTIONS = [
  'split',
  'focus',
] as const satisfies readonly ComparisonLayout[]

function isComparisonLayout(value: unknown): value is ComparisonLayout {
  return (
    typeof value === 'string' &&
    (COMPARISON_LAYOUT_OPTIONS as readonly string[]).includes(value)
  )
}

type Props = {
  value: ComparisonLayout
  onChange: (l: ComparisonLayout) => void
}

export function ComparisonLayoutPicker({value, onChange}: Props) {
  return (
    <RadioGroup
      aria-label="Comparison layout"
      variant="scrim"
      value={value}
      onValueChange={(next) => {
        if (isComparisonLayout(next)) onChange(next)
      }}
    >
      {COMPARISON_LAYOUT_OPTIONS.map((layout) => (
        <RadioGroupItem
          key={layout}
          value={layout}
          variant="scrim"
          className="px-10 py-4 capitalize"
        >
          {layout}
        </RadioGroupItem>
      ))}
    </RadioGroup>
  )
}
