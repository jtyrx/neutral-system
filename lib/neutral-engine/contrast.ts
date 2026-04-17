import Color from 'colorjs.io'

const WHITE = new Color('white')
const BLACK = new Color('black')

export function contrastVsWhite(bg: Color): number {
  return WHITE.contrastWCAG21(bg)
}

export function contrastVsBlack(bg: Color): number {
  return BLACK.contrastWCAG21(bg)
}

/** WCAG contrast text on background. */
export function contrastTextOnBg(text: Color, bg: Color): number {
  return text.contrastWCAG21(bg)
}

export type WcagLevel = 'fail' | 'AA' | 'AAA'

export function wcagLargeText(level: number): WcagLevel {
  if (level >= 7) return 'AAA'
  if (level >= 4.5) return 'AA'
  return 'fail'
}

export function wcagUi(level: number): WcagLevel {
  if (level >= 4.5) return 'AAA'
  if (level >= 3) return 'AA'
  return 'fail'
}
