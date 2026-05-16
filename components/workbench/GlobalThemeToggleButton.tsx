'use client'

import {Fragment, memo, useSyncExternalStore} from 'react'
import {Monitor, Moon, Sun} from 'lucide-react'
import {useTheme} from 'next-themes'

import {RadioGroup, RadioGroupItem} from '@/components/ui/radio-group.tsx'
import {Tooltip, TooltipContent, TooltipTrigger} from '@/components/ui/tooltip.tsx'
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
          'inline-flex h-8 shrink-0 items-center gap-0.25 rounded-full bg-toolbar-control-surface-sunken p-1',
          className,
        )}
      >
        {OPTIONS.map((option) => (
          <span
            key={option.value}
            className="inline-flex size-6.75 items-center justify-center rounded-full border border-transparent text-disabled"
          />
        ))}
      </div>
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
      variant="icon"
      value={activeTheme}
      onValueChange={(value) => setTheme(value as ThemeChoice)}
      data-ns-theme-toggle
      aria-label={`Application color theme. Current selection: ${activeTheme}. Resolved theme: ${resolved}.`}
      className={className}
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon
        const item = (
          <RadioGroupItem
            value={option.value}
            variant="icon"
            aria-label={option.label}
          >
            <Icon className="size-3.75" aria-hidden={true} />
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
