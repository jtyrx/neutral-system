'use client'

import {memo, useCallback} from 'react'
import {Check, ChevronDown} from 'lucide-react'

import {GlobalThemeToggleButton} from '@/components/workbench/GlobalThemeToggleButton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuList,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {cn} from '@/lib/cn'
import type {ContrastEmphasis} from '@/lib/neutral-engine'

type Props = {
  contrastEmphasis: ContrastEmphasis
  onContrastEmphasis: (e: ContrastEmphasis, label?: string) => void
  showContrastPairs?: boolean
  onShowContrastPairs?: (v: boolean) => void
  /** Tighter padding for toolbars */
  dense?: boolean
  /** When false, only contrast mapping is shown (e.g. split comparison already shows both themes). */
  showThemeToggle?: boolean
}

const EMPHASIS_ORDER: ContrastEmphasis[] = ['subtle', 'default', 'strong', 'inverse']

const EMPHASIS_LABEL: Record<ContrastEmphasis, string> = {
  subtle: 'Subtle',
  default: 'Default',
  strong: 'Strong',
  inverse: 'Inverse',
}

const EMPHASIS_DESC: Record<ContrastEmphasis, string> = {
  subtle: 'Lower contrast, softer visual weight.',
  default: 'Balanced contrast for general use.',
  strong: 'Higher contrast, stronger visual weight.',
  inverse: 'Inverted contrast mapping.',
}

function ThemePreviewControlsInner({
  contrastEmphasis,
  onContrastEmphasis,
  showContrastPairs,
  onShowContrastPairs,
  dense,
}: Props) {
  const onSubtle = useCallback(
    () => onContrastEmphasis('subtle', `Contrast · ${EMPHASIS_LABEL.subtle}`),
    [onContrastEmphasis],
  )
  const onDefault = useCallback(
    () => onContrastEmphasis('default', `Contrast · ${EMPHASIS_LABEL.default}`),
    [onContrastEmphasis],
  )
  const onStrong = useCallback(
    () => onContrastEmphasis('strong', `Contrast · ${EMPHASIS_LABEL.strong}`),
    [onContrastEmphasis],
  )
  const onInverse = useCallback(
    () => onContrastEmphasis('inverse', `Contrast · ${EMPHASIS_LABEL.inverse}`),
    [onContrastEmphasis],
  )

  const emphasisHandler: Record<ContrastEmphasis, () => void> = {
    subtle: onSubtle,
    default: onDefault,
    strong: onStrong,
    inverse: onInverse,
  }

  return (
    <div className={cn('flex flex-wrap items-center gap-2', !dense && 'gap-3')}>
      <div
        className="flex items-center gap-2 border-r border-hairline pr-2 sm:pr-2.5"
        role="group"
        aria-label="Application color theme"
      >
        <GlobalThemeToggleButton />
      </div>
      {onShowContrastPairs ? (
        <label className="flex cursor-pointer items-center gap-2 text-xs text-subtle">
          <input
            type="checkbox"
            className="rounded border-hairline-strong bg-raised"
            checked={showContrastPairs ?? false}
            onChange={(e) => onShowContrastPairs(e.target.checked)}
          />
          Contrast pairs
        </label>
      ) : null}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="group flex items-center gap-1.5 rounded-xl border border-transparent bg-transparent px-2.5 py-1.5 text-xs font-light text-subtle transition-colors hover:bg-chip hover:text-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
          >
            <span>Contrast</span>
            <span className="font-medium text-default">
              {EMPHASIS_LABEL[contrastEmphasis]}
            </span>
            <ChevronDown className="size-3 shrink-0 text-muted-foreground" aria-hidden />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent variant="panel" align="start" sideOffset={8}>
          <DropdownMenuLabel>Contrast mapping</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuList>
            {EMPHASIS_ORDER.map((e) => {
              const selected = contrastEmphasis === e
              return (
                <DropdownMenuItem
                  key={e}
                  onClick={emphasisHandler[e]}
                  data-active={selected ? 'true' : undefined}
                >
                  <div>
                    <div className="text-sm font-normal">{EMPHASIS_LABEL[e]}</div>
                    <p className="text-xs text-muted-foreground">{EMPHASIS_DESC[e]}</p>
                  </div>
                  {selected ? (
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  ) : (
                    <span className="size-4 shrink-0" aria-hidden />
                  )}
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuList>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export const ThemePreviewControls = memo(ThemePreviewControlsInner)
