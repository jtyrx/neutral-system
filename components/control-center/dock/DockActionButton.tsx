'use client'

import {Monitor, Moon, Palette, Sun} from 'lucide-react'
import {
  forwardRef,
  memo,
  useCallback,
  useSyncExternalStore,
  type ComponentPropsWithoutRef,
} from 'react'
import {useTheme} from 'next-themes'

import {Button} from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {cn} from '@/lib/utils'

export type OklchLauncherButtonProps = Omit<
  ComponentPropsWithoutRef<'button'>,
  'children' | 'onClick' | 'type'
> & {
  onOpen: () => void
}

const subscribeMounted = () => () => {}
const getMountedSnapshot = () => true
const getServerMountedSnapshot = () => false

const dockActionClassName =
  'size-11 shrink-0 touch-manipulation rounded-dock-item border-[color:var(--chrome-hairline)] bg-raised text-default backdrop-blur-none hover:bg-overlay hover:text-default active:bg-[color-mix(in_oklch,var(--color-surface-overlay)_92%,var(--color-text-default))] focus-visible:border-[color:var(--ring)] focus-visible:shadow-[var(--shadow-raised),0_0_0_3px_color-mix(in_oklch,var(--ring)_35%,transparent)] [&_svg]:size-[1.125rem]'

export const OklchLauncherButton = memo(forwardRef<
  HTMLButtonElement,
  OklchLauncherButtonProps
>(function OklchLauncherButton({onOpen, className, ...rest}, ref) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          ref={ref}
          type="button"
          variant="outline"
          size="icon"
          className={cn(dockActionClassName, className)}
          aria-label="Open OKLCH picker surface"
          data-slot="dock-oklch-launcher"
          id="dock-oklch-launcher"
          onClick={onOpen}
          {...rest}
        >
          <Palette aria-hidden />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}><span className="text-label">Open OKLCH picker</span></TooltipContent>
    </Tooltip>
  )
}))

function useIsClientMounted() {
  return useSyncExternalStore(
    subscribeMounted,
    getMountedSnapshot,
    getServerMountedSnapshot,
  )
}

export const ThemeCycleButton = memo(function ThemeCycleButton() {
  const {theme, setTheme} = useTheme()
  const mounted = useIsClientMounted()

  const cycle = useCallback(() => {
    if (!mounted) return
    const t = theme ?? 'system'
    if (t === 'light') setTheme('dark')
    else if (t === 'dark') setTheme('system')
    else setTheme('light')
  }, [mounted, setTheme, theme])

  const icon = !mounted ? (
    <Sun aria-hidden />
  ) : theme === 'dark' ? (
    <Moon aria-hidden />
  ) : theme === 'light' ? (
    <Sun aria-hidden />
  ) : (
    <Monitor aria-hidden />
  )

  const label = !mounted
    ? 'Theme (loading)'
    : theme === 'light'
      ? 'Theme: light - cycle to dark'
      : theme === 'dark'
        ? 'Theme: dark - cycle to system'
        : 'Theme: system - cycle to light'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={dockActionClassName}
          aria-label={label}
          data-slot="dock-theme-toggle"
          id="dock-theme-toggle"
          onClick={cycle}
        >
          {icon}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="top" sideOffset={6}><span className="text-label">Cycle theme (light - dark - system)</span></TooltipContent>
    </Tooltip>
  )
})
