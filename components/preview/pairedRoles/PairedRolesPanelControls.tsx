'use client'

import {Check} from 'lucide-react'

import {Button} from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuList,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import {ControlTier} from '@/components/preview/SegmentedControl'
import {
  PANEL_CONFIG,
  usePanelState,
  type RoleScope,
} from '@/components/preview/pairedRoles/PairedRolesPanelContext'
import {SegmentedToolbar} from '@/components/preview/pairedRoles/SegmentedToolbar'

const ROLE_SCOPE_DESC: Record<RoleScope, string> = {
  all: 'All semantic token roles across every layer.',
  surface: 'Fill and background tokens for containers and cards.',
  border: 'Stroke, divider, and outline tokens.',
  text: 'Foreground content and icon color tokens.',
  inverse: 'Tokens for reversed-contrast surfaces.',
  interactive: 'State layers, overlays, and focus indicators.',
}

export function PairedRolesPanelControls() {
  const {
    variant,
    focusTheme,
    inspectionView,
    themeFocus,
    roleScope,
    displayMode,
    showThemeTier,
    showPrimitiveTiers,
    onInspection,
    onThemeFocus,
    onRoleScope,
    onDisplay,
  } = usePanelState()

  const activeScopeLabel =
    PANEL_CONFIG.roleScopeOptions.find(o => o.value === roleScope)?.label ?? roleScope

  return (
    <div className="space-y-16">
      <ControlTier label="Inspection">
        <SegmentedToolbar
          aria-label="Inspection view"
          value={inspectionView}
          options={PANEL_CONFIG.inspectionOptions}
          onChange={onInspection}
        />
      </ControlTier>

      {showThemeTier ? (
        <ControlTier label="Theme context">
          <SegmentedToolbar
            aria-label="Theme context for primitive inspection"
            value={themeFocus}
            options={PANEL_CONFIG.themeFocusOptions}
            onChange={onThemeFocus}
          />
          <p className="mt-8 text-nano text-disabled">
            {inspectionView === 'neutral'
              ? PANEL_CONFIG.themeFocusHint.neutral
              : PANEL_CONFIG.themeFocusHint.paired}
          </p>
        </ControlTier>
      ) : null}

      {variant === 'focus' && inspectionView === 'neutral' ? (
        <ControlTier label="Preview theme">
          <p className="text-xs font-medium text-subtle">
            {focusTheme === 'light'
              ? 'Light (amber) — matches toolbar preview'
              : 'Dark elevated (sky) — matches toolbar preview'}
          </p>
        </ControlTier>
      ) : null}

      {showPrimitiveTiers && variant === 'focus' ? (
        <ControlTier label="Preview theme">
          <p className="text-xs font-medium text-subtle">
            {focusTheme === 'light'
              ? 'Light — matches toolbar preview (amber chrome below)'
              : 'Dark elevated — matches toolbar preview (sky chrome below)'}
          </p>
        </ControlTier>
      ) : null}

      {showPrimitiveTiers ? (
        <div className="flex items-end gap-16">
          <ControlTier label="Semantic layer">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button.MenuTrigger
                  aria-label={`Semantic layer: ${activeScopeLabel}`}
                  label="Layer"
                  value={activeScopeLabel}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent variant="panel" align="start" sideOffset={8}>
                <DropdownMenuLabel>Semantic layer</DropdownMenuLabel>
                <p className="px-12 pb-10 text-micro leading-snug text-muted-foreground">
                  Filter paired roles by token category.
                </p>
                <DropdownMenuSeparator />
                <DropdownMenuList>
                  {PANEL_CONFIG.roleScopeOptions.map(option => {
                    const selected = option.value === roleScope
                    return (
                      <DropdownMenuItem
                        key={option.value}
                        onClick={() => onRoleScope(option.value)}
                        data-active={selected ? 'true' : undefined}
                      >
                        <div className="flex min-w-0 flex-1 flex-col gap-2">
                          <div className="text-label font-medium leading-tight">
                            {option.label}
                          </div>
                          <p className="text-[0.7rem] leading-[1.35] text-muted-foreground">
                            {ROLE_SCOPE_DESC[option.value]}
                          </p>
                        </div>
                        {selected ? (
                          <Check
                            className="mt-2 size-16 shrink-0 text-primary"
                            aria-hidden
                          />
                        ) : (
                          <span className="size-16 shrink-0" aria-hidden />
                        )}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuList>
              </DropdownMenuContent>
            </DropdownMenu>
          </ControlTier>

          <ControlTier label="Display">
            <SegmentedToolbar
              aria-label="Paired roles display mode"
              value={displayMode}
              options={PANEL_CONFIG.displayOptions}
              onChange={onDisplay}
            />
          </ControlTier>
        </div>
      ) : null}
    </div>
  )
}
PairedRolesPanelControls.displayName = 'PairedRolesPanelControls'
