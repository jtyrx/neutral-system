import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'overlay-menu',
  entries: [
    {
      element: 'Anchor background',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
    },
    {
      element: 'Anchor border',
      dtcgPath: 'color.border.muted',
      cssVar: '--color-border-muted',
      usage: 'border-color',
    },
    {
      element: 'Anchor text',
      dtcgPath: 'color.text.subtle',
      cssVar: '--color-text-subtle',
      usage: 'color',
    },
    {
      element: 'Menu plane',
      dtcgPath: 'color.surface.overlay',
      cssVar: '--color-surface-overlay',
      usage: 'background-color',
      description: 'Floating overlay surface — sits above the page plane in the z-axis.',
    },
    {
      element: 'Menu border',
      dtcgPath: 'color.border.default',
      cssVar: '--color-border-default',
      usage: 'border-color',
    },
    {
      element: 'Menu item label',
      dtcgPath: 'color.text.default',
      cssVar: '--color-text-default',
      usage: 'color',
    },
  ],
}
