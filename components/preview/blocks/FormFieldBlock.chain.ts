import type {BlockChainSpec} from '@/components/preview/blockChainTypes'

export const chainSpec: BlockChainSpec = {
  blockId: 'form-field',
  entries: [
    {
      element: 'Field label',
      dtcgPath: 'color.text.subtle',
      cssVar: '--color-text-subtle',
      usage: 'color',
      description: 'Secondary emphasis for field labels above the control.',
    },
    {
      element: 'Placeholder',
      dtcgPath: 'color.text.muted',
      cssVar: '--color-text-muted',
      usage: 'color',
      description: 'Hint text inside an empty, editable field.',
    },
    {
      element: 'Field edge (active)',
      dtcgPath: 'color.border.strong',
      cssVar: '--color-border-strong',
      usage: 'border-color',
      description: 'High-emphasis border for the active/focused input field.',
    },
    {
      element: 'Field edge (read-only)',
      dtcgPath: 'color.border.default',
      cssVar: '--color-border-default',
      usage: 'border-color',
      description: 'Default border for read-only fields.',
    },
    {
      element: 'Read-only value',
      dtcgPath: 'color.text.disabled',
      cssVar: '--color-text-disabled',
      usage: 'color',
      description: 'Non-editable export or locked token value inside the field.',
    },
  ],
}
