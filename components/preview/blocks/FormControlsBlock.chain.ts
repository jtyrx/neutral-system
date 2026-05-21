import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'form-controls',
  entries: [
    {
      element: 'Block background',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
      description: 'Default page canvas — the neutral ground all form controls sit on.',
    },
    {
      element: 'Field label',
      dtcgPath: 'color.text.subtle',
      cssVar: '--color-text-subtle',
      usage: 'color',
      description: 'Secondary text emphasis for input labels and group headings.',
    },
    {
      element: 'Field edge',
      dtcgPath: 'color.border.default',
      cssVar: '--color-border-default',
      usage: 'border-color',
      description: 'Default border stroke for input fields at rest.',
    },
  ],
}
