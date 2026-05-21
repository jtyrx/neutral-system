import type {CaseRenderProps} from '@/components/preview/blockTypes'
import {Badge} from '@/components/ui/badge.tsx'
import {Button} from '@/components/ui/button.tsx'
import {Skeleton} from '@/components/ui/skeleton.tsx'

export function FeedbackBlock({c}: CaseRenderProps) {
  return (
    <div className="space-y-16 rounded-md p-12" style={{backgroundColor: c.page}}>
      <div className="space-y-8">
        <p className="text-micro font-medium uppercase tracking-wide" style={{color: c.tm}}>Loading</p>
        <div className="space-y-6">
          <Skeleton className="h-16 w-2/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-4/5" />
        </div>
      </div>
      <div className="space-y-8">
        <p className="text-micro font-medium uppercase tracking-wide" style={{color: c.tm}}>Toast</p>
        <div
          className="flex items-start justify-between gap-12 rounded-md border px-12 py-10 shadow-overlay"
          style={{backgroundColor: c.overlay, borderColor: c.bd}}
        >
          <div className="min-w-0">
            <p className="text-xs font-semibold" style={{color: c.td}}>Export complete</p>
            <p className="mt-2 text-micro" style={{color: c.ts}}>Your CSV is ready to download.</p>
          </div>
          <Button variant="ghost" size="icon-sm" className="shrink-0 text-lg leading-none" style={{color: c.tm}}>
            ×
          </Button>
        </div>
      </div>
      <div className="space-y-8">
        <p className="text-micro font-medium uppercase tracking-wide" style={{color: c.tm}}>Badges</p>
        <div className="flex flex-wrap gap-6">
          <Badge variant="default" style={{backgroundColor: c.raised, borderColor: c.bd, color: c.td}}>Default</Badge>
          <Badge variant="subtle" style={{backgroundColor: c.subtle, borderColor: c.bs, color: c.ts}}>Subtle</Badge>
          <Badge variant="solid" style={{backgroundColor: c.inverse, color: c.ton}}>Inverse</Badge>
          <Badge variant="brand" style={{backgroundColor: c.brand, color: c.ton}}>Brand</Badge>
          <Badge variant="destructive" >Destructive</Badge>
          <Badge variant="outline" >Outline</Badge>
          <Badge variant="ghost" >Ghost</Badge>
          <Badge variant="link" >Link</Badge>
          <Badge variant="disabled" style={{opacity: 0.5}}>Disabled</Badge>
        </div>
      </div>
    </div>
  )
}
FeedbackBlock.displayName = 'FeedbackBlock'
