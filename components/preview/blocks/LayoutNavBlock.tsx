'use client'

import {useState} from 'react'

import {SemanticTokenAnnotation} from '@/components/preview/SemanticTokenAnnotation'
import type {CaseRenderProps} from '@/components/preview/blockTypes'

export function LayoutNavBlock({c, theme, inspection, onSelectSystem}: CaseRenderProps) {
  const [activeNav, setActiveNav] = useState(0)
  return (
    <div className="space-y-8">
      <div
        className="flex min-h-176 overflow-hidden rounded-md border"
        style={{backgroundColor: c.page, borderColor: c.bs}}
      >
        <aside
          className="flex w-[32%] shrink-0 flex-col border-r"
          style={{
            backgroundColor: c.sunken,
            borderColor: c.bs,
            boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.04), inset 2px 0 6px rgba(0,0,0,0.04)',
          }}
        >
          <p
            className="border-b px-8 py-6 text-nano font-medium uppercase tracking-wide"
            style={{borderColor: c.bs, color: c.tm}}
          >
            Navigation
          </p>
          <nav className="flex flex-col gap-2 p-8">
            {['Overview', 'Reports', 'Settings'].map((item, i) => (
              <button
                key={item}
                type="button"
                onClick={() => setActiveNav(i)}
                className="rounded px-8 py-6 text-left text-xs transition-colors"
                style={{
                  backgroundColor: activeNav === i ? c.page : 'transparent',
                  color: activeNav === i ? c.td : c.ts,
                  fontWeight: activeNav === i ? 600 : 400,
                }}
              >
                {item}
              </button>
            ))}
          </nav>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="border-b px-12 py-8 text-xs" style={{borderColor: c.bs, color: c.td}}>
            Main workspace
          </div>
          <div className="flex-1 p-8 sm:p-12">
            <div className="rounded-md border p-8 sm:p-12" style={{backgroundColor: c.subtle, borderColor: c.bs}}>
              <p className="text-xs font-medium" style={{color: c.td}}>
                Panel
              </p>
              <p className="mt-4 text-micro leading-relaxed" style={{color: c.ts}}>
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
