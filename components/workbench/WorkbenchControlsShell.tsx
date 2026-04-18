'use client'

import {BuilderControlsSections} from '@/components/workbench/BuilderControlsSections'
import {SidebarNav} from '@/components/workbench/SidebarNav'
import type {NeutralWorkbench} from '@/hooks/useNeutralWorkbench'

type Props = {
  wb: NeutralWorkbench
  selectedGlobalIndex: number | null
}

/** Left column: navigation + grouped controls (desktop); scrollable. */
export function WorkbenchControlsShell({wb, selectedGlobalIndex}: Props) {
  return (
    <div className="flex max-h-[min(100dvh,100%)] min-h-0 flex-col border-white/10 lg:max-h-dvh">
      <div className="shrink-0 border-b border-white/10 px-4 py-4 sm:px-5">
        <p className="eyebrow">Workbench</p>
        <h1 className="mt-1 text-lg font-semibold tracking-tight text-white">Neutral System</h1>
        <p className="mt-2 text-xs text-white/45">
          Role-first neutrals · OKLCH ramp · Light / Dark elevated from one scale.
        </p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto py-4">
        <div className="mb-6">
          <SidebarNav />
        </div>
        <BuilderControlsSections wb={wb} selectedGlobalIndex={selectedGlobalIndex} />
      </div>
    </div>
  )
}
