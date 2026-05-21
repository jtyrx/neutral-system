import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'callout',
  entries: [
    {
      element: 'Inverse strip background',
      dtcgPath: 'color.surface.inverse',
      cssVar: '--color-surface-inverse',
      usage: 'background-color',
      description: 'High-contrast inverse surface — flips the palette for system notifications.',
    },
    {
      element: 'Container border',
      dtcgPath: 'color.border.default',
      cssVar: '--color-border-default',
      usage: 'border-color',
    },
    {
      element: 'Text on inverse / brand',
      dtcgPath: 'color.text.on',
      cssVar: '--color-text-on',
      usage: 'color',
      description: 'Text color guaranteed to pass contrast on both inverse and brand surfaces.',
    },
  ],
}
