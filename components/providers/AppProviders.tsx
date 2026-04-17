'use client'

import type {ReactNode} from 'react'
import {Toaster} from 'sonner'

type Props = {
  children: ReactNode
}

export function AppProviders({children}: Props) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        theme="dark"
        richColors
        closeButton
        toastOptions={{
          classNames: {
            toast: 'border border-white/15 bg-[oklch(16%_0.02_285_/0.95)] backdrop-blur-xl',
            title: 'text-white/90',
            description: 'text-white/60',
          },
        }}
      />
    </>
  )
}
