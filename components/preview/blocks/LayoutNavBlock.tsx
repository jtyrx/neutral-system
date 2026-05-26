'use client'

import {useState} from 'react'

import type {BlockCaseProps} from '@/components/preview/blockTypes'
import {
  PreviewBlockCanvas,
  PreviewBlockShell,
} from '@/components/preview/blocks/previewSpecimen'
import {cn} from '@/lib/utils'

const NAV_ITEMS = ['Ramp', 'Roles', 'Preview', 'Export'] as const

export function LayoutNavBlock({theme, inspection, onSelectSystem}: BlockCaseProps) {
  const [activeNav, setActiveNav] = useState(0)

  return (
    <PreviewBlockShell
      theme={theme}
      inspection={inspection}
      onSelectSystem={onSelectSystem}
      footnotes={[
        {prefix: 'nav well', role: 'surface.sunken'},
        {prefix: 'active item', role: 'surface.default'},
        {prefix: 'workspace', role: 'surface.default'},
        {prefix: 'dividers', role: 'border.subtle'},
      ]}
    >
      <PreviewBlockCanvas tone="flush" className="overflow-hidden">
        <div className="flex min-h-144 flex-col sm:min-h-160 sm:flex-row">
          <aside className="flex w-full shrink-0 flex-col border-b border-hairline bg-sunken sm:w-40 sm:border-r sm:border-b-0">
            <p className="border-b border-hairline px-8 py-5 font-mono text-nano uppercase tracking-[0.12em] text-muted">
              Workbench
            </p>
            <nav className="flex flex-row gap-2 p-4 sm:flex-col">
              {NAV_ITEMS.map((item, i) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setActiveNav(i)}
                  className={cn(
                    'rounded-control px-8 py-5 text-left text-xs transition-colors',
                    activeNav === i
                      ? 'bg-default font-medium text-default shadow-raised'
                      : 'text-subtle hover:text-default',
                  )}
                >
                  {item}
                </button>
              ))}
            </nav>
          </aside>
          <div className="flex min-w-0 flex-1 flex-col bg-default p-8 sm:p-10">
            <p className="text-xs font-medium text-default">{NAV_ITEMS[activeNav]}</p>
            <p className="mt-4 max-w-prose text-micro leading-relaxed text-subtle">
              Recessed nav, active row, primary canvas.
            </p>
          </div>
        </div>
      </PreviewBlockCanvas>
    </PreviewBlockShell>
  )
}
LayoutNavBlock.displayName = 'LayoutNavBlock'
