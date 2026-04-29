'use client'

import {Fragment, memo, useSyncExternalStore} from 'react'
import {Monitor, Moon, Sun} from 'lucide-react'
import {useTheme} from 'next-themes'

import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group'
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip'
import {useFinePointerHover} from '@/hooks/use-fine-pointer-hover'
import {cn} from '@/lib/cn'

type ThemeChoice = 'system' | 'dark' | 'light'

const OPTIONS: {
  value: ThemeChoice
  label: string
  shortLabel: string
  icon: typeof Monitor
}[] = [
  {
    value: 'system',
    label: 'Use system theme',
    shortLabel: 'System',
    icon: Monitor,
  },
  {value: 'dark', label: 'Use dark theme', shortLabel: 'Dark', icon: Moon},
  {value: 'light', label: 'Use light theme', shortLabel: 'Light', icon: Sun},
]

function GlobalThemeToggleButtonInner({className}: {className?: string}) {
  const {theme, setTheme, resolvedTheme} = useTheme()
  const showTooltips = useFinePointerHover()
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )

  if (!mounted) {
    return (
      <div
        aria-hidden={true}
        className={cn(
          'flex h-7 w-20 shrink-0 rounded-full border border-hairline bg-overlay sm:w-23',
          className,
        )}
      />
    )
  }

  const activeTheme: ThemeChoice =
    theme === 'light' || theme === 'dark' || theme === 'system'
      ? theme
      : 'system'
  const resolved = resolvedTheme === 'light' ? 'light' : 'dark'

  return (
    <RadioGroup
      id="nsb-theme-toggle"
      variant="scrim"
      value={activeTheme}
      onValueChange={(value) => setTheme(value as ThemeChoice)}
      data-ns-theme-toggle
      aria-label={`Application color theme. Current selection: ${activeTheme}. Resolved theme: ${resolved}.`}
      className={cn(
        'inline-flex items-center gap-0.5 rounded-full',
        // Icon radio: hide the default dot indicator from the base shadcn item.
        '**:data-[slot=radio-group-indicator]:hidden',
        className,
      )}
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon
        const selected = activeTheme === option.value
        const item = (
          <RadioGroupItem
            value={option.value}
            aria-label={option.label}
            className={cn(
              'inline-flex size-6 cursor-pointer items-center justify-center rounded-full border border-transparent text-disabled transition-colors outline-none',
              'hover:bg-(--ns-chip) hover:text-(--ns-text)',
              'focus-visible:border-focus focus-visible:ring-2 focus-visible:ring-(--ns-border-focus)/30',
              selected && 'bg-(--ns-overlay-strong) text-primary',
            )}
          >
            <Icon className="size-3.5" aria-hidden={true} />
            <span className="sr-only">{option.label}</span>
          </RadioGroupItem>
        )

        if (!showTooltips) {
          return <Fragment key={option.value}>{item}</Fragment>
        }

        return (
          <Tooltip key={option.value}>
            <TooltipTrigger asChild>{item}</TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={8}>
              {option.shortLabel}
            </TooltipContent>
          </Tooltip>
        )
      })}
    </RadioGroup>
  )
}

export const GlobalThemeToggleButton = memo(GlobalThemeToggleButtonInner)
