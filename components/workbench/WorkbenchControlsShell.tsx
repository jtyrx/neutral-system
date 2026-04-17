'use client'

import {BuilderControlsSections} from '@/components/workbench/BuilderControlsSections'
import {SidebarNav} from '@/components/workbench/SidebarNav'
import type {NeutralWorkbench} from '@/hooks/useNeutralWorkbench'

type Props = {
  wb: NeutralWorkbench
  selectedGlobalIndex: number | null
}

/**
 * Supporting region below the live preview: navigation + all builder sections.
 * Isolated for future tools (presets, contrast audits, etc.).
 */
export function WorkbenchControlsShell({wb, selectedGlobalIndex}: Props) {
  return (
    <div className="ns-workbench__controls border-t border-white/10 bg-black/15">
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <header className="mb-8 hidden border-b border-white/10 pb-6 lg:block">
          <p className="eyebrow">Workbench</p>
          <h1 className="mt-1 text-xl font-semibold tracking-tight text-white">Neutral System Builder</h1>
          <p className="mt-2 max-w-2xl text-sm text-white/45">
            OKLCH-first ramps · systematic light/dark neutrals. Use section links to jump; the live
            preview above updates as you edit.
          </p>
        </header>

        <div className="mb-8">
          <SidebarNav />
        </div>

        <BuilderControlsSections wb={wb} selectedGlobalIndex={selectedGlobalIndex} />
      </div>
    </div>
  )
}
