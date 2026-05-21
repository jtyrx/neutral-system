import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {Input} from '@/components/ui/input.tsx'

export function FormFieldBlock({theme, inspection, onSelectSystem}: BlockCaseProps) {
  return (
    <div className="space-y-12">
      <label className="block space-y-4">
        <span className="text-micro font-medium text-subtle">
          Company
        </span>
        <Input
          placeholder="Search accounts…"
          className="border-brand"
        />
        <span className="flex flex-wrap items-center gap-x-2 text-nano text-white/45">
          <span>placeholder</span>
          <SemanticTokenAnnotation role="text.muted" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
          <span>·</span>
          <span>field edge</span>
          <SemanticTokenAnnotation role="border.strong" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        </span>
      </label>
      <label className="block space-y-4">
        <span className="text-micro font-medium text-subtle">
          Read-only
        </span>
        <Input
          readOnly
          aria-readonly="true"
          className="cursor-default border-default text-disabled"
          defaultValue="INV-20418 · locked"
        />
        <span className="flex items-center gap-x-2 text-nano text-white/45">
          <span>locked text</span>
          <SemanticTokenAnnotation role="text.disabled" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        </span>
      </label>
      <p className="flex flex-wrap items-center gap-x-2 text-micro leading-snug text-subtle">
        <span>Use a shorter billing cycle to reduce variance.</span>
        <SemanticTokenAnnotation role="text.subtle" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </p>
    </div>
  )
}
FormFieldBlock.displayName = 'FormFieldBlock'
