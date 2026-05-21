'use client'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet.tsx'
import {BlockTokenChainPanel} from '@/components/preview/BlockTokenChainPanel'
import {PREVIEW_BLOCK_CASES} from '@/components/preview/previewBlockRegistry'
import type {GlobalSwatch, SystemToken} from '@/lib/neutral-engine/types'

type Props = {
  globalLight: GlobalSwatch[]
  globalDark: GlobalSwatch[]
  lightTokens: SystemToken[]
  darkTokens: SystemToken[]
  selectedBlockId: string | null
  onClose: () => void
}

export function TokenChainDrawer({
  globalLight,
  globalDark,
  lightTokens,
  darkTokens,
  selectedBlockId,
  onClose,
}: Props) {
  const block = PREVIEW_BLOCK_CASES.find(b => b.id === selectedBlockId)
  const isOpen = block?.chainSpec != null

  return (
    <Sheet open={isOpen} onOpenChange={open => { if (!open) onClose() }}>
      <SheetContent side="right" size="default" className="w-[420px] p-0">
        <SheetHeader className="border-b border-hairline px-16 py-12">
          <span className="text-nano font-mono font-medium uppercase tracking-[0.14em] text-muted">
            Token chain
          </span>
          <SheetTitle className="text-sm font-semibold tracking-tight text-default">
            {block?.title ?? ''}
          </SheetTitle>
          <SheetDescription className="sr-only">
            Primitive → semantic → component token chain for {block?.title ?? 'this block'}
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto px-16 py-16">
          {block?.chainSpec != null && (
            <BlockTokenChainPanel
              spec={block.chainSpec}
              globalLight={globalLight}
              globalDark={globalDark}
              lightTokens={lightTokens}
              darkTokens={darkTokens}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

TokenChainDrawer.displayName = 'TokenChainDrawer'
