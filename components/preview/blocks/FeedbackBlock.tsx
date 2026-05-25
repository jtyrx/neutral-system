import type {CaseRenderProps} from '@/components/preview/blockTypes'
import {Badge} from '@/components/ui/badge.tsx'
import {Button} from '@/components/ui/button.tsx'
import {Skeleton} from '@/components/ui/skeleton.tsx'

export function FeedbackBlock({c}: CaseRenderProps) {
  return (
    <div className="space-y-16 rounded-md bg-default p-12">
      <div className="space-y-8">
        <p className="text-micro font-medium uppercase tracking-wide text-muted">Loading</p>
        <div className="space-y-6">
          <Skeleton className="h-16 w-2/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-4/5" />
        </div>
      </div>
      <div className="space-y-8">
        <p className="text-micro font-medium uppercase tracking-wide text-muted">Toast</p>
        <div className="flex items-start justify-between gap-12 rounded-md border border-default bg-overlay px-12 py-10 shadow-overlay">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-default">Export complete</p>
            <p className="mt-2 text-micro text-subtle">Your CSV is ready to download.</p>
          </div>
          <Button variant="ghost" size="icon-sm" className="shrink-0 text-lg leading-none text-muted">
            ×
          </Button>
        </div>
      </div>
      <div className="space-y-8">
        <p className="text-micro font-medium uppercase tracking-wide text-muted">Badges</p>
        <div className="flex flex-wrap gap-6">
          <Badge variant="default" className="bg-raised border-default text-default">Default</Badge>
          <Badge variant="subtle" className="bg-subtle border-subtle text-subtle">Subtle</Badge>
          <Badge variant="solid" className="bg-inverse text-on">Inverse</Badge>
          <Badge variant="brand" style={{backgroundColor: c.brand}} className="text-on">Brand</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="ghost">Ghost</Badge>
          <Badge variant="link">Link</Badge>
          <Badge variant="disabled" className="opacity-50">Disabled</Badge>
        </div>
      </div>
    </div>
  )
}
FeedbackBlock.displayName = 'FeedbackBlock'
