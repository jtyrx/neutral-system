'use client'

import {createContext, useContext, type ReactNode} from 'react'

import {useColorPalettes, type ColorPalettesWorkbench} from '@/hooks/useColorPalettes'

const ColorPalettesContext = createContext<ColorPalettesWorkbench | null>(null)

export function ColorPalettesProvider({children}: {children: ReactNode}) {
  const workbench = useColorPalettes()
  return (
    <ColorPalettesContext.Provider value={workbench}>
      {children}
    </ColorPalettesContext.Provider>
  )
}
ColorPalettesProvider.displayName = 'ColorPalettesProvider'

export function useColorPalettesContext(): ColorPalettesWorkbench {
  const ctx = useContext(ColorPalettesContext)
  if (!ctx) throw new Error('useColorPalettesContext must be used within ColorPalettesProvider')
  return ctx
}
