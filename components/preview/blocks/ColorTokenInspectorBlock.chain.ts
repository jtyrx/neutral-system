import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'color-token-inspector',
  entries: [
    {
      element: 'Block background',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
      description: 'Default page canvas — neutral ground for the token swatch grid.',
    },
    {
      element: 'Block border',
      dtcgPath: 'color.border.muted',
      cssVar: '--color-border-muted',
      usage: 'border-color',
      description: 'Low-emphasis container edge — recedes behind the swatch content.',
    },
    {
      element: 'Group label',
      dtcgPath: 'color.text.muted',
      cssVar: '--color-text-muted',
      usage: 'color',
      description: 'Tertiary text — category headings (Surface, Border, Text) at minimal emphasis.',
    },
  ],
}
