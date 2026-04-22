import type {CSSProperties, DetailedHTMLProps, HTMLAttributes} from 'react'

type ColorPickerHostProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  space?: string
  'space-id'?: string
  alpha?: boolean | string
  style?: CSSProperties
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'color-picker': ColorPickerHostProps
    }
  }
}

export {}
