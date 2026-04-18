import {semanticCategory} from '@/lib/neutral-engine/semanticNaming'
import type {SystemRole} from '@/lib/neutral-engine/types'

/** Primary UI label for a semantic category (used when grouping by primitive layer). */
export function friendlySemanticCategoryLabel(category: string): string {
  switch (category) {
    case 'surface':
      return 'Surface'
    case 'border':
      return 'Border'
    case 'text':
      return 'Content'
    case 'interactive':
      return 'State & overlay'
    case 'emphasis':
      return 'Emphasis'
    case 'inversePair':
      return 'Inverse'
    default:
      return category
  }
}

/** Primary UI label for mapping groups — uses dot-path roles. */
export function friendlySemanticGroupLabel(role: SystemRole): string {
  const cat = semanticCategory(role)
  if (role.startsWith('emphasis.')) {
    if (role.startsWith('emphasis.surface')) return 'Emphasis · surface'
    if (role.startsWith('emphasis.border')) return 'Emphasis · border'
    if (role.startsWith('emphasis.text')) return 'Emphasis · content'
    return 'Emphasis'
  }
  return friendlySemanticCategoryLabel(cat)
}

/** Human-readable row label for a token role. */
export function humanizeRole(role: SystemRole): string {
  return role.replace(/\./g, ' · ')
}
