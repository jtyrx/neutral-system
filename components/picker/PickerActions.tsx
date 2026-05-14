'use client'

import Link from 'next/link'
import {memo, useCallback} from 'react'

import {Button} from '@/components/ui/button'
import type {WorkbenchAdapterMode} from '@/hooks/useWorkbenchAdapter'
import type {GlobalScaleConfig} from '@/lib/neutral-engine/types'
import type {NeutralArchitectureMode} from '@/lib/neutral-engine/types'
import {toast} from 'sonner'

type Props = {
  architecture: NeutralArchitectureMode
  globalScale: GlobalScaleConfig
  lightScale: GlobalScaleConfig
  darkScale: GlobalScaleConfig
  pickerOklchCss: string
  adapterMode: WorkbenchAdapterMode
  /** When `embedded`, copy is tuned for the inspector aside (user already on workbench). */
  variant?: 'standalone' | 'embedded'
}

function PickerActionsInner({
  architecture,
  globalScale,
  lightScale,
  darkScale,
  pickerOklchCss,
  adapterMode,
  variant = 'standalone',
}: Props) {
  const embedded = variant === 'embedded'

  const sendToWorkbench = useCallback(() => {
    if (typeof window === 'undefined') return
    if (adapterMode === 'live') {
      toast.message('Already synced — this page drives live theme CSS.')
      return
    }
    window.dispatchEvent(
      new CustomEvent('neutral-system:load-preset', {
        detail: {
          architecture,
          globalScale: architecture === 'simple' ? globalScale : undefined,
          lightScale: architecture === 'advanced' ? lightScale : undefined,
          darkScale: architecture === 'advanced' ? darkScale : undefined,
        },
      }),
    )
    toast.success(
      embedded ? 'Global scale applied from picker' : 'Preset loaded — open workbench',
      {duration: 3500},
    )
  }, [adapterMode, architecture, darkScale, embedded, globalScale, lightScale])

  const copyOklch = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(pickerOklchCss)
      toast.success('Copied OKLCH')
    } catch {
      toast.error('Could not copy')
    }
  }, [pickerOklchCss])

  const liveHint = adapterMode === 'live'

  return (
    <div className="picker-control-row">
      <Button
        type="button"
        variant={liveHint ? 'outline' : 'default'}
        size={embedded ? 'sm' : 'default'}
        onClick={sendToWorkbench}
      >
        {liveHint ? 'Live theme active' : embedded ? 'Apply to global scale' : 'Send to workbench'}
      </Button>
      <Button type="button" variant="outline" size={embedded ? 'sm' : 'default'} onClick={copyOklch}>
        Copy OKLCH
      </Button>
      {!embedded ? (
        <Button type="button" variant="ghost" asChild nativeButton={false}>
          <Link href="/">Open workbench</Link>
        </Button>
      ) : null}
    </div>
  )
}

export const PickerActions = memo(PickerActionsInner)
