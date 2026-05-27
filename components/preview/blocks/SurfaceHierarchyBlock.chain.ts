import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'surface-hierarchy',
  entries: [
    {
      element: 'Sunken well',
      dtcgPath: 'color.surface.sunken',
      cssVar: '--color-surface-sunken',
      usage: 'background-color',
      description: 'Lowest surface elevation — recessed wells, sidebars, troughs.',
    },
    {
      element: 'Default canvas',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
      description: 'Base page surface — the neutral ground all content sits on.',
    },
    {
      element: 'Raised card',
      dtcgPath: 'color.surface.raised',
      cssVar: '--color-surface-raised',
      usage: 'background-color',
      description: 'Elevated surface for cards and panels that float above the page.',
    },
    {
      element: 'Overlay plane',
      dtcgPath: 'color.surface.overlay',
      cssVar: '--color-surface-overlay',
      usage: 'background-color',
      description: 'Highest elevation — menus, popovers, dialogs.',
    },
    {
      element: 'Subtle border',
      dtcgPath: 'color.border.muted',
      cssVar: '--color-border-muted',
      usage: 'border-color',
      description: 'Low-emphasis structural divider — sunken and default tiers.',
    },
    {
      element: 'Default border',
      dtcgPath: 'color.border.default',
      cssVar: '--color-border-default',
      usage: 'border-color',
      description: 'Standard border for raised and overlay tiers.',
    },
  ],
}
