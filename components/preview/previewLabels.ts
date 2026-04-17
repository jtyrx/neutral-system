import type {SystemRole} from '@/lib/neutral-engine/types'

export {ROLE_DISPLAY_ORDER} from '@/lib/neutral-engine/tokenViews'

/** Primary UI label for mapping groups (token names like fill-0 stay as secondary). */
export function friendlySemanticGroupLabel(role: SystemRole): string {
  switch (role) {
    case 'fill':
      return 'Surface'
    case 'stroke':
      return 'Border'
    case 'text':
      return 'Content'
    case 'alt':
      return 'Overlay'
    case 'contrastFill':
      return 'Contrast · surface'
    case 'contrastStroke':
      return 'Contrast · border'
    case 'contrastText':
      return 'Contrast · content'
    case 'contrastAlt':
      return 'Contrast · overlay'
    default:
      return role
  }
}

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
