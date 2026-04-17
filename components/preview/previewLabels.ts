import type {SystemRole} from '@/lib/neutral-engine/types'

/** Stable ordering for role display in comparison panels. */
export const ROLE_DISPLAY_ORDER: SystemRole[] = [
  'fill',
  'stroke',
  'text',
  'alt',
  'contrastFill',
  'contrastStroke',
  'contrastText',
  'contrastAlt',
]

export function humanizeRole(role: SystemRole): string {
  switch (role) {
    case 'fill':
      return 'Fill'
    case 'stroke':
      return 'Stroke'
    case 'text':
      return 'Text'
    case 'alt':
      return 'Alt / overlay'
    case 'contrastFill':
      return 'Contrast fill'
    case 'contrastStroke':
      return 'Contrast stroke'
    case 'contrastText':
      return 'Contrast text'
    case 'contrastAlt':
      return 'Contrast alt'
    default:
      return role
  }
}
