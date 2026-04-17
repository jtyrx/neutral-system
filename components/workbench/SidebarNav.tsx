'use client'

import {memo} from 'react'

const LINKS = [
  {id: 'global', label: 'Global scale'},
  {id: 'system', label: 'System mapping'},
  {id: 'themes', label: 'Light / dark'},
  {id: 'variants', label: 'Variants'},
  {id: 'preview', label: 'UI preview'},
  {id: 'export', label: 'Export'},
] as const

function SidebarNavInner() {
  return (
    <nav className="ns-panel flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] lg:sticky lg:top-0 lg:max-h-[min(100vh-2rem,48rem)] lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:rounded-2xl lg:border lg:p-3 [&::-webkit-scrollbar]:hidden">
      <p className="eyebrow shrink-0 px-1 py-2 lg:py-0">Sections</p>
      {LINKS.map((l) => (
        <a
          key={l.id}
          href={`#${l.id}`}
          className="shrink-0 rounded-lg px-2 py-2 text-sm whitespace-nowrap text-white/75 transition hover:bg-white/8 hover:text-white lg:whitespace-normal"
        >
          {l.label}
        </a>
      ))}
    </nav>
  )
}

export const SidebarNav = memo(SidebarNavInner)
