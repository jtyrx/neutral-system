'use client'

import Link from 'next/link'
import {Palette} from 'lucide-react'
import {memo, useMemo} from 'react'

import {OklchPickerEmbeddedTuneBlocks} from '@/components/picker/OklchPickerEmbeddedTuneBlocks'
import {OklchPickerMainBlocks} from '@/components/picker/OklchPickerMainBlocks'
import {OklchPickerStandaloneSettings} from '@/components/picker/OklchPickerStandaloneSettings'
import {GamutBadge} from '@/components/picker/GamutBadge'
import {Button} from '@/components/ui/button.tsx'
import type {WorkbenchAdapter} from '@/hooks/useWorkbenchAdapter'
import {useDisplayGamut} from '@/hooks/useDisplayGamut'
import {cn} from '@/lib/utils'

export type OklchPickerPanelVariant = 'standalone' | 'embedded'

type Props = {
  adapter: WorkbenchAdapter
  variant?: OklchPickerPanelVariant
  className?: string
}

function OklchPickerPanelInner({adapter, variant = 'standalone', className}: Props) {
  const embedded = variant === 'embedded'
  const {tier} = useDisplayGamut()

  const headerBadgeExtras = useMemo(
    () => (
      <>
        <GamutBadge tier={tier} />
        <Button type="button" variant="outline" size="sm" onClick={adapter.resetToDefaults}>
          Reset
        </Button>
      </>
    ),
    [adapter, tier],
  )

  return (
    <div
      className={cn(
        embedded ? 'space-y-20 text-default' : 'mx-auto max-w-6xl space-y-24 px-16 py-32 text-default',
        className,
      )}
    >
      {embedded ? (
        <div className="space-y-8">
          <p className="text-xs text-muted">
            Parallel{' '}
            <code className="font-mono text-caption">buildGlobalScale</code> surface — does not
            change live theme CSS
            {adapter.mode === 'sandbox' ? ' until you apply below' : ''}.
          </p>
          <div className="picker-control-row">
            {headerBadgeExtras}
            <Button type="button" variant="ghost" size="sm" asChild nativeButton={false}>
              <Link href="/picker">Full-screen picker</Link>
            </Button>
          </div>
        </div>
      ) : (
        <header className="flex flex-col gap-12 border-b border-hairline pb-24 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-12">
            <Palette className="mt-2 size-32 shrink-0 text-muted" aria-hidden />
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                OKLCH picker · {adapter.mode === 'live' ? 'live theme' : 'parallel engine surface'}
              </h1>
              <p className="mt-4 max-w-2xl text-sm text-muted">
                {adapter.mode === 'live'
                  ? 'Inspect gamut boundaries and tune L / C / H. Changes update CSS variables on this page via the same engine as the main workbench.'
                  : 'Inspect gamut boundaries and tune L / C / H. This sandbox keeps its own config until you send it to the workbench.'}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-8">
            {headerBadgeExtras}
            <Button type="button" variant="ghost" size="sm" asChild nativeButton={false}>
              <Link href="/">Main workbench</Link>
            </Button>
          </div>
        </header>
      )}

      <OklchPickerMainBlocks adapter={adapter} layout={embedded ? 'embedded' : 'page'} />

      {embedded ? (
        <OklchPickerEmbeddedTuneBlocks adapter={adapter} />
      ) : (
        <OklchPickerStandaloneSettings adapter={adapter} />
      )}
    </div>
  )
}

export const OklchPickerPanel = memo(OklchPickerPanelInner)
