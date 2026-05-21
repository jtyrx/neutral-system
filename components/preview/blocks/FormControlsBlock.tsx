'use client'

import {useState} from 'react'

import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {Input} from '@/components/ui/input.tsx'
import {SliderField} from '@/components/ui/slider.tsx'
import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group.tsx'

export function FormControlsBlock({theme, inspection, onSelectSystem}: BlockCaseProps) {
  const [alignValue, setAlignValue] = useState<string[]>(['center'])

  return (
    <div className="space-y-16 rounded-md bg-default p-12">
      <div className="grid gap-16 sm:grid-cols-2">
        <div className="space-y-12">
          <div className="space-y-4">
            <label className="text-micro font-medium text-subtle">Default</label>
            <Input placeholder="Enter a value…" className="border-default" />
          </div>
          <div className="space-y-4">
            <label className="text-micro font-medium text-subtle">Disabled</label>
            <Input placeholder="Not editable" disabled />
          </div>
          <div className="space-y-4">
            <label className="text-micro font-medium text-subtle">Invalid</label>
            <Input aria-invalid defaultValue="bad@value" />
          </div>
        </div>
        <div className="space-y-16">
          <SliderField label="Opacity" defaultValue={[60]} min={0} max={100} />
          <div className="space-y-4">
            <p className="text-micro font-medium text-subtle">Alignment</p>
            <ToggleGroup
              value={alignValue}
              onValueChange={setAlignValue}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="left">Left</ToggleGroupItem>
              <ToggleGroupItem value="center">Center</ToggleGroupItem>
              <ToggleGroupItem value="right">Right</ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-4 text-nano text-white/45">
        <span>field edge</span>
        <SemanticTokenAnnotation role="border.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>focus ring</span>
        <SemanticTokenAnnotation role="border.focus" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>placeholder</span>
        <SemanticTokenAnnotation role="text.muted" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
    </div>
  )
}
FormControlsBlock.displayName = 'FormControlsBlock'
