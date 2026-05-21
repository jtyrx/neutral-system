import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {CaseRenderProps} from '@/components/preview/blockTypes'
import {Button} from '@/components/ui/button.tsx'

export function OverlayMenuBlock({c, theme, inspection, onSelectSystem}: CaseRenderProps) {
  return (
    <div className="space-y-8">
      <div className="relative min-h-[7rem] rounded-md border p-12" style={{backgroundColor: c.page, borderColor: c.bs}}>
        <p className="text-xs" style={{color: c.ts}}>
          Anchor region
        </p>
        <div
          className="pointer-events-none absolute inset-0 rounded-md"
          style={{backgroundColor: c.scrimBg}}
          aria-hidden
        />
        <div
          className="absolute left-12 top-40 z-10 min-w-[11rem] rounded-md border py-4 shadow-xl"
          style={{backgroundColor: c.overlay, borderColor: c.bd, boxShadow: '0 16px 40px rgba(0,0,0,0.18)'}}
        >
          <Button variant="ghost" size="sm" className="w-full justify-start" style={{color: c.td}}>
            Duplicate
          </Button>
          <Button variant="ghost" size="sm" className="w-full justify-start" style={{color: c.td}}>
            Archive
          </Button>
          <div className="my-4 border-t" style={{borderColor: c.bs}} />
          <Button variant="ghost" size="sm" className="w-full justify-start" style={{color: c.td}}>
            Delete…
          </Button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-4 text-nano text-white/45">
        <span>menu plane</span>
        <SemanticTokenAnnotation role="surface.overlay" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>edge</span>
        <SemanticTokenAnnotation role="border.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>item label</span>
        <SemanticTokenAnnotation role="text.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>scrim</span>
        <SemanticTokenAnnotation role="overlay.scrim" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
    </div>
  )
}
OverlayMenuBlock.displayName = 'OverlayMenuBlock'
