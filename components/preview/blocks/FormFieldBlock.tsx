import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {
  PreviewBlockShell,
  PreviewSpecimen,
  PreviewSpecimenStack,
} from '@/components/preview/blocks/previewSpecimen'
import {Input} from '@/components/ui/input.tsx'

export function FormFieldBlock({theme, inspection, onSelectSystem}: BlockCaseProps) {
  return (
    <PreviewBlockShell
      theme={theme}
      inspection={inspection}
      onSelectSystem={onSelectSystem}
      footnotes={[
        {prefix: 'label', role: 'text.subtle'},
        {prefix: 'placeholder', role: 'text.muted'},
        {prefix: 'read-only value', role: 'text.disabled'},
        {prefix: 'active edge', role: 'border.emphasis'},
        {prefix: 'read-only edge', role: 'border.default'},
      ]}
    >
      <PreviewSpecimenStack>
        <PreviewSpecimen label="Active">
          <label className="flex w-full flex-col gap-4">
            <span className="text-micro font-medium text-subtle">Token path</span>
            <Input placeholder="surface.default" className="border-emphasis" />
          </label>
        </PreviewSpecimen>
        <PreviewSpecimen label="Read-only">
          <label className="flex w-full flex-col gap-4">
            <span className="text-micro font-medium text-subtle">CSS variable</span>
            <Input
              readOnly
              aria-readonly="true"
              className="cursor-default border-default text-disabled"
              defaultValue="--color-neutral-12"
            />
          </label>
        </PreviewSpecimen>
      </PreviewSpecimenStack>
    </PreviewBlockShell>
  )
}
FormFieldBlock.displayName = 'FormFieldBlock'
