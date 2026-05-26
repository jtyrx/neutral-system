'use client'

import {useState} from 'react'

import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {
  PreviewBlockCanvas,
  PreviewBlockShell,
  PreviewBlockSplit,
  PreviewKbd,
  PreviewSpecimen,
  PreviewSpecimenStack,
  previewSectionRule,
} from '@/components/preview/blocks/previewSpecimen'
import {Input} from '@/components/ui/input.tsx'
import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group.tsx'
import {SliderField} from '@/components/ui/slider.tsx'
import {ToggleGroup, ToggleGroupItem} from '@/components/ui/toggle-group.tsx'

export function FormControlsBlock({
  theme,
  inspection,
  onSelectSystem,
}: BlockCaseProps) {
  const [view, setView] = useState<string[]>(['ramp'])
  const [density, setDensity] = useState('comfortable')

  return (
    <PreviewBlockShell
      theme={theme}
      inspection={inspection}
      onSelectSystem={onSelectSystem}
      footnotes={[
        {prefix: 'field edge', role: 'border.default'},
        {prefix: 'focus ring', role: 'border.focus'},
        {prefix: 'placeholder', role: 'text.muted'},
      ]}
    >
      <PreviewBlockCanvas>
        <PreviewSpecimen label="Input">
          <PreviewSpecimenStack className="gap-6">
            <Input placeholder="Token name…" />
            <Input placeholder="Locked field" disabled />
            <Input aria-invalid defaultValue="bad@value" />
            <div className="relative max-w-sm">
              <Input placeholder="Search roles…" className="pr-28" />
              <div className="pointer-events-none absolute top-1/2 right-8 flex -translate-y-1/2 gap-4">
                <PreviewKbd>⌘</PreviewKbd>
                <PreviewKbd>K</PreviewKbd>
              </div>
            </div>
            <SliderField label="Chroma taper" defaultValue={[42]} min={0} max={100} />
          </PreviewSpecimenStack>
        </PreviewSpecimen>

        <PreviewBlockSplit className={previewSectionRule}>
          <PreviewSpecimen label="Tabs">
            <ToggleGroup
              value={view}
              onValueChange={setView}
              variant="outline"
              size="sm"
              className="w-full max-w-xs"
            >
              <ToggleGroupItem value="ramp" className="flex-1">
                Ramp
              </ToggleGroupItem>
              <ToggleGroupItem value="roles" className="flex-1">
                Roles
              </ToggleGroupItem>
              <ToggleGroupItem value="export" className="flex-1">
                Export
              </ToggleGroupItem>
            </ToggleGroup>
          </PreviewSpecimen>
          <PreviewSpecimen label="Radio">
            <RadioGroup
              value={density}
              onValueChange={(value) => {
                if (typeof value === 'string') setDensity(value)
              }}
              variant="scrim"
              className="w-fit"
            >
              <RadioGroupItem value="compact">Compact</RadioGroupItem>
              <RadioGroupItem value="comfortable">Comfortable</RadioGroupItem>
              <RadioGroupItem value="spacious">Spacious</RadioGroupItem>
            </RadioGroup>
          </PreviewSpecimen>
        </PreviewBlockSplit>
      </PreviewBlockCanvas>
    </PreviewBlockShell>
  )
}
FormControlsBlock.displayName = 'FormControlsBlock'
