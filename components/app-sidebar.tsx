'use client'

import {useSyncExternalStore, type ReactNode} from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { BookOpen, Check, Home, Layers, Settings, Sliders } from 'lucide-react'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarResizer,
  SidebarSeparator,
  SidebarTrigger,
} from '@/components/ui/sidebar.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import {ControlCenterDebugGate} from '@/components/control-center/debug/ControlCenterDebugGate'
import {ControlCenterElevationProvider} from '@/components/control-center/debug/ControlCenterElevationProvider'
import {NeutralWorkbenchProvider} from '@/components/providers/NeutralWorkbenchProvider'
import {
  dockElevationDebugEnabled,
  subscribeDockElevationDebug,
  toggleDockElevationDebugOptIn,
} from '@/lib/debug/dockElevationDebug'

const ControlCenter = dynamic(
  () =>
    import('@/components/control-center/ControlCenter').then((m) => ({
      default: m.ControlCenter,
    })),
  {ssr: false, loading: () => null},
)

type AppLayoutShellProps = {
  children: ReactNode
}

/**
 * Collapsible icon rail + inset main: keeps canvas space while a draft nav loads.
 * `inset` matches shadcn’s “card” main region; swap `collapsible` to `offcanvas` if you
 * want the bar to fully hide instead of icon-only.
 */
export function AppLayoutShell({
  children,
}: AppLayoutShellProps) {
  return (
    <SidebarProvider>
      <ControlCenterElevationProvider>
        <NeutralWorkbenchProvider>
          <AppSidebar />
          <SidebarInset
            id="nsb-inset"
            className="min-h-svh flex-1 flex-col bg-sunken text-(--color-text-default)"
          >
            <header
              id="nsb-chrome-header"
              className="border-b border-hairline bg-(--color-surface-raised)/80 px-12 py-8 backdrop-blur-sm md:rounded-tr-xl"
            >
              <div className="mx-auto flex h-36 items-center gap-8 sm:px-0">
                <SidebarTrigger />
                <p className="eyebrow hidden text-default sm:block">Builder</p>
              </div>
            </header>
            <div
              id="nsb-viewport"
              className="@container/nsb-workbench min-h-0 min-w-0 flex-1 "
            >
              {children}
            </div>
            <ControlCenter />
          </SidebarInset>
        </NeutralWorkbenchProvider>
        <ControlCenterDebugGate />
      </ControlCenterElevationProvider>
    </SidebarProvider>
  )
}

function SidebarDockElevationDebugMenuItem() {
  const enabled = useSyncExternalStore(
    subscribeDockElevationDebug,
    dockElevationDebugEnabled,
    () => false,
  )
  if (process.env.NODE_ENV !== 'development') return null
  return (
    <>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={() => {
          toggleDockElevationDebugOptIn()
        }}
      >
        <span className="flex min-w-0 flex-1 items-center gap-8">
          <span className="flex size-16 shrink-0 justify-center">
            {enabled ? <Check className="size-16" aria-hidden /> : null}
          </span>
          <span className="min-w-0">Dock blur tuning</span>
        </span>
      </DropdownMenuItem>
    </>
  )
}

export function AppSidebar() {
  return (
    <Sidebar id="nsb-nav" variant="inset" collapsible="icon" side="left">
      <SidebarHeader>
        <div className="flex items-center gap-8 py-4">
          <div className="grid size-32 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground text-trim-both">
            NS
          </div>
          <div className="min-w-0 flex flex-col gap-5 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-label font-mono uppercase text-trim-both">Neutral System</p>
            <p className="truncate text-[0.625rem] leading-tight text-sidebar-foreground/70 text-trim-both">Draft v0.1</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive tooltip="Builder">
                  <Link href="/">
                    <Home />
                    <span>Builder</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator className="mx-0" />

        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton disabled aria-disabled="true" tooltip="Coming soon">
                  <Sliders />
                  <span>Scales</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton disabled aria-disabled="true" tooltip="Coming soon">
                  <Layers />
                  <span>Roles</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton disabled aria-disabled="true" tooltip="Coming soon">
                  <BookOpen />
                  <span>Reference</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-8">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton tooltip="Settings">
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>About</DropdownMenuItem>
                <SidebarDockElevationDebugMenuItem />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarResizer />
    </Sidebar>
  )
}
