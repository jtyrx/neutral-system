'use client'

import {memo} from 'react'

const LINKS = [
  {id: 'global', label: 'Scale'},
  {id: 'system', label: 'Mapping'},
  {id: 'themes', label: 'Theme tables'},
  {id: 'preview', label: 'Preview'},
  {id: 'export', label: 'Export'},
] as const

function SidebarNavInner() {
  return (
    <nav className="ns-panel flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] nsb-lg:sticky nsb-lg:top-0 nsb-lg:max-h-[min(100vh-2rem,48rem)] nsb-lg:flex-col nsb-lg:overflow-y-auto nsb-lg:overflow-x-visible nsb-lg:rounded-sm nsb-lg:border nsb-lg:p-12 [&::-webkit-scrollbar]:hidden">
      <p className="eyebrow shrink-0 px-4 py-8 nsb-lg:py-0">Sections</p>
      {LINKS.map((l) => (
        <a
          key={l.id}
          href={`#${l.id}`}
          className="shrink-0 rounded-lg px-8 py-8 text-sm whitespace-nowrap text-subtle transition hover:bg-(--chrome-chip) hover:text-default nsb-lg:whitespace-normal"
        >
          {l.label}
        </a>
      ))}
    </nav>
  )
}

export const SidebarNav = memo(SidebarNavInner)
