import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'button-variants',
  entries: [
    {
      element: 'Matrix canvas',
      dtcgPath: 'color.surface.default',
      cssVar: '--color-surface-default',
      usage: 'background-color',
      description:
        'Neutral canvas behind the variant matrix. All button fills and rings are judged against this plane.',
    },
    {
      element: 'Default / outline primary actions',
      dtcgPath: 'color.surface.inverse',
      cssVar: '--color-surface-inverse',
      usage: 'background-color',
      description:
        'Inverse surface fill for default-variant buttons at rest (maps to btn-sys data-variant=default).',
    },
    {
      element: 'Secondary actions',
      dtcgPath: 'color.surface.brand',
      cssVar: '--color-surface-brand',
      usage: 'background-color',
      description: 'Brand plane fill for secondary-variant buttons at rest.',
    },
    {
      element: 'Keyboard focus ring',
      dtcgPath: 'color.border.focus',
      cssVar: '--color-border-focus',
      usage: 'box-shadow',
      description:
        'Focus ring token applied via Button focus-visible styles. Inspect on the Focus ring specimen row with Tab.',
    },
    {
      element: 'Button label on filled surfaces',
      dtcgPath: 'color.text.on',
      cssVar: '--color-text-on',
      usage: 'color',
      description: 'Foreground ink on inverse and brand button fills.',
    },
  ],
}
