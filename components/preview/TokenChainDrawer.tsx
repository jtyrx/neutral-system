'use client'

import {useEffect} from 'react'

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

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen || block?.chainSpec == null) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Token chain: ${block.title}`}
        className="fixed right-0 top-0 z-50 flex h-full w-[420px] max-w-full flex-col overflow-hidden border-l border-hairline bg-raised shadow-lg"
      >
        {/* Header */}
        <header className="flex shrink-0 items-center justify-between gap-8 border-b border-hairline px-16 py-12">
          <div className="flex flex-col gap-2">
            <span className="text-nano font-mono font-medium uppercase tracking-[0.14em] text-muted">
              Token chain
            </span>
            <span className="text-sm font-semibold tracking-tight text-default">
              {block.title}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close token chain drawer"
            className="flex h-28 w-28 shrink-0 items-center justify-center rounded text-muted transition-colors hover:bg-overlay hover:text-default"
          >
            {/* X icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M12 4L4 12M4 4l8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </header>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-16 py-16">
          <BlockTokenChainPanel
            spec={block.chainSpec}
            globalLight={globalLight}
            globalDark={globalDark}
            lightTokens={lightTokens}
            darkTokens={darkTokens}
          />
        </div>
      </aside>
    </>
  )
}

TokenChainDrawer.displayName = 'TokenChainDrawer'
