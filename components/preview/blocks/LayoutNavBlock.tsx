'use client'

import {useState} from 'react'

import {cn} from '@/lib/utils'
import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {BlockCaseProps} from '@/components/preview/blockTypes'

export function LayoutNavBlock({theme, inspection, onSelectSystem}: BlockCaseProps) {
  const [activeNav, setActiveNav] = useState(0)
  return (
    <div className="space-y-8">
      <div className="flex min-h-176 overflow-hidden rounded-md border border-subtle bg-default">
        <aside
          className="flex w-[32%] shrink-0 flex-col border-r border-subtle bg-sunken"
          style={{boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.04), inset 2px 0 6px rgba(0,0,0,0.04)'}}
        >
          <p className="border-b border-subtle px-8 py-6 text-nano font-medium uppercase tracking-wide text-muted">
            Navigation
          </p>
          <nav className="flex flex-col gap-2 p-8">
            {['Overview', 'Reports', 'Settings'].map((item, i) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveNav(i)}
                className={cn(
                  'rounded px-8 py-6 text-left text-xs transition-colors',
                  activeNav === i
                    ? 'bg-default font-semibold text-default'
                    : 'bg-transparent font-normal text-subtle',
                )}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b border-subtle px-12 py-8 text-xs text-default">
            Main workspace
          </div>
          <div className="flex-1 p-8 sm:p-12">
            <div className="rounded-md border border-subtle bg-subtle p-8 sm:p-12">
              <p className="text-xs font-medium text-default">
                Panel
              </p>
              <p className="mt-4 text-micro leading-relaxed text-subtle">
                Section dividers stay quiet so structure reads without heavy chrome.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-4 text-nano text-white/45">
        <span>sidebar well</span>
        <SemanticTokenAnnotation role="surface.sunken" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>active row</span>
        <SemanticTokenAnnotation role="surface.default" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>panel</span>
        <SemanticTokenAnnotation role="surface.subtle" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
        <span>·</span>
        <span>dividers</span>
        <SemanticTokenAnnotation role="border.subtle" inspection={inspection} theme={theme} onSelect={onSelectSystem} />
      </div>
    </div>
  )
}
LayoutNavBlock.displayName = 'LayoutNavBlock'
