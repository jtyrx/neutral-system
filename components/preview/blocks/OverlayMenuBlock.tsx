'use client'

import type {CaseRenderProps} from '@/components/preview/blockTypes'
import {
  PreviewBlockCanvas,
  PreviewBlockShell,
  PreviewSpecimen,
  PreviewSpecimenStack,
} from '@/components/preview/blocks/previewSpecimen'
import {Button} from '@/components/ui/button.tsx'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu.tsx'
import {
  Popover,
  PopoverContent,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover.tsx'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip.tsx'

export function OverlayMenuBlock({
  theme,
  inspection,
  onSelectSystem,
}: CaseRenderProps) {
  return (
    <PreviewBlockShell
      theme={theme}
      inspection={inspection}
      onSelectSystem={onSelectSystem}
      footnotes={[
        {prefix: 'overlay plane', role: 'surface.overlay'},
        {prefix: 'panel edge', role: 'border.default'},
        {prefix: 'item label', role: 'text.default'},
      ]}
    >
      <PreviewBlockCanvas>
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
          <PreviewSpecimen label="Popover" className="min-w-0 flex-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  Open
                </Button>
              </PopoverTrigger>
              <PopoverContent side="bottom" align="start" className="gap-6">
                <PopoverTitle>Role interval</PopoverTitle>
                <div className="flex justify-end gap-6">
                  <Button variant="ghost" size="sm">
                    Cancel
                  </Button>
                  <Button variant="default" size="sm">
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </PreviewSpecimen>

          <PreviewSpecimenStack className="w-full shrink-0 gap-10 lg:max-w-[14rem]">
            <PreviewSpecimen label="Tooltip">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-fit font-mono">
                      surface.raised
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <span className="font-mono text-micro">oklch(22.33% 0 0)</span>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </PreviewSpecimen>
            <PreviewSpecimen label="Menu">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    Actions
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem>Duplicate role</DropdownMenuItem>
                  <DropdownMenuItem>Copy CSS variable</DropdownMenuItem>
                  <DropdownMenuItem>Reset mapping</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </PreviewSpecimen>
          </PreviewSpecimenStack>
        </div>
      </PreviewBlockCanvas>
    </PreviewBlockShell>
  )
}
OverlayMenuBlock.displayName = 'OverlayMenuBlock'
