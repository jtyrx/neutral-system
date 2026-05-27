export type PaletteName = 'blue' | 'green' | 'orange' | 'yellow' | 'red' | 'purple'

export type PaletteTheme = 'light' | 'dark'

export type PaletteGamut = 'srgb' | 'display-p3' | 'rec2020'

export type OklchStop = {
  index: number
  L: number
  C: number
  H: number
  hex: string
  oklchCss: string
  inSrgb: boolean
  inP3: boolean
  srgbDeltaE: number
  contrastOnWhite: {wcag: number; apca: number}
  contrastOnBlack: {wcag: number; apca: number}
  contrastOnSurface: {wcag: number; apca: number}
}

export type PaletteConfig = {
  name: PaletteName
  hue: number
}

export type GeneratedPalette = {
  config: PaletteConfig
  light: OklchStop[]
  dark: OklchStop[]
}

export type ContrastReport = {
  wcag: number
  apca: number
}
