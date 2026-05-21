import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {CaseRenderProps} from '@/components/preview/blockTypes'
import {Input} from '@/components/ui/input.tsx'

export function FormFieldBlock({c, theme, inspection, onSelectSystem}: CaseRenderProps) {
  return (
    <div className="space-y-12">
      <label className="block space-y-4">
        <span className="text-micro font-medium" style={{color: c.ts}}>
          Company
        </span>
        <Input
          placeholder="Search accounts…"
          style={{borderColor: c.bStr}}
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
        <span className="text-micro font-medium" style={{color: c.ts}}>
          Read-only
        </span>
        <Input
          readOnly
          aria-readonly="true"
          className="cursor-default"
          style={{borderColor: c.bd, color: c.tdis}}
          defaultValue="INV-20418 · locked"
        />
        <span className="flex items-center gap-x-2 text-nano text-white/45">
          <span>locked text</span>
          <SemanticTokenAnnotation role="text.disabled" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        </span>
      </label>
      <p className="flex flex-wrap items-center gap-x-2 text-micro leading-snug" style={{color: c.ts}}>
        <span>Use a shorter billing cycle to reduce variance.</span>
        <SemanticTokenAnnotation role="text.subtle" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </p>
    </div>
  )
}
FormFieldBlock.displayName = 'FormFieldBlock'
