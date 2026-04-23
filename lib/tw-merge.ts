import {extendTailwindMerge} from 'tailwind-merge'

// Custom `@utility` classes under `text-*` must be registered or tailwind-merge
// treats them as built-in `text-*` (font-size) and they overwrite each other.
export const twMerge = extendTailwindMerge<'text-box-trim'>({
  extend: {
    classGroups: {
      'text-box-trim': ['text-trim-both'],
    },
  },
})
