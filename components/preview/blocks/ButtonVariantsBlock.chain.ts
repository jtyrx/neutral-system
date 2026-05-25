import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'button-variants',
  entries: [
    {
      element: 'Page background',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
      description: 'Neutral canvas behind the button matrix — establishes the baseline against which all button fill, border, and ring tokens are evaluated.',
    },
  ],
}
