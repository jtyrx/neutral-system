'use client'

import {useState} from 'react'

import {exportPalettesCss} from '@/lib/color-engine/exportFormats'
import type {GeneratedPalette} from '@/lib/color-engine/types'

type Props = {
  palettes: GeneratedPalette[]
}

export function ColorExportSection({palettes}: Props) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const css = exportPalettesCss(palettes)
    await navigator.clipboard.writeText(css)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex items-center gap-8 px-16 py-12 border-t border-hairline">
      <span className="text-[0.7rem] text-subtle">Export</span>
      <button
        type="button"
        onClick={handleCopy}
        className="rounded-md border border-hairline bg-raised px-10 py-5 font-mono text-[0.7rem] text-default transition-colors hover:bg-subtle"
      >
        {copied ? 'Copied!' : 'Copy CSS variables'}
      </button>
    </div>
  )
}
ColorExportSection.displayName = 'ColorExportSection'
