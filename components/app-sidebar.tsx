'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { BookOpen, Home, Layers, Settings, Sliders } from 'lucide-react'

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
} from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type AppLayoutShellProps = {
  children: ReactNode
  /** After mount, delay then collapse the desktop sidebar. When omitted, `SidebarProvider` defaults apply. */
  sidebarCloseOnLoad?: boolean
  /** When omitted, `SidebarProvider` uses its default delay (500ms). */
  sidebarCloseOnLoadDelayMs?: number
}

/**
 * Collapsible icon rail + inset main: keeps canvas space while a draft nav loads.
 * `inset` matches shadcn’s “card” main region; swap `collapsible` to `offcanvas` if you
 * want the bar to fully hide instead of icon-only.
 */
export function AppLayoutShell({
  children,
  sidebarCloseOnLoad,
  sidebarCloseOnLoadDelayMs,
}: AppLayoutShellProps) {
  return (
    <SidebarProvider
      defaultOpen
      {...(sidebarCloseOnLoad !== undefined
        ? {closeOnLoad: sidebarCloseOnLoad}
        : {})}
      {...(sidebarCloseOnLoadDelayMs !== undefined
        ? {closeOnLoadDelayMs: sidebarCloseOnLoadDelayMs}
        : {})}
    >
      <AppSidebar />
      <SidebarInset
        id="nsb-inset"
        className="min-h-svh flex-1 flex-col bg-(--color-surface-sunken) text-(--color-text-default)"
      >
        <header
          id="nsb-chrome-header"
          className="border-b border-hairline bg-(--color-surface-raised)/80 px-3 py-2 backdrop-blur-sm md:rounded-tr-xl"
        >
          <div className="mx-auto flex h-9 items-center gap-2 sm:px-0">
            <SidebarTrigger />
            <p className="eyebrow hidden text-default sm:block">Builder</p>
          </div>
        </header>
        <div
          id="nsb-viewport"
          className="@container/nsb-workbench min-h-0 min-w-0 flex-1 z-0"
        >
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function AppSidebar() {
  return (
    <Sidebar id="nsb-nav" variant="inset" collapsible="icon" side="left">
      <SidebarHeader>
        <div className="flex items-center gap-2 py-1">
          <div className="grid size-8 shrink-0 place-items-center rounded-md bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground text-trim-both">
            NS
          </div>
          <div className="min-w-0 flex flex-col gap-1.25 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-[0.8125rem] font-mono uppercase text-trim-both">Neutral System</p>
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

      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<SidebarMenuButton tooltip="Settings" />}
              >
                <Settings />
                <span>Settings</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end">
                <DropdownMenuLabel>Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Preferences</DropdownMenuItem>
                <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>About</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarResizer />
    </Sidebar>
  )
}
