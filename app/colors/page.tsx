import type {Metadata} from 'next'

import {ColorPalettesProvider} from '@/components/providers/ColorPalettesProvider'
import {ColorWorkbench} from '@/components/colors/ColorWorkbench'

export const metadata: Metadata = {
  title: 'Colors',
}

export default function ColorsPage() {
  return (
    <ColorPalettesProvider>
      <ColorWorkbench />
    </ColorPalettesProvider>
  )
}
