import { updatePrimaryPalette } from '@primeuix/themes'

export type ColorThemeName = 'emerald' | 'blue' | 'violet' | 'rose'

export interface ColorTheme {
  name: ColorThemeName
  /** カラーサークル表示用 hex（color-500 相当） */
  color: string
  palette: Record<string, string>
}

export const COLOR_THEMES: ColorTheme[] = [
  {
    name: 'emerald',
    color: '#10b981',
    palette: {
      50: '{emerald.50}',
      100: '{emerald.100}',
      200: '{emerald.200}',
      300: '{emerald.300}',
      400: '{emerald.400}',
      500: '{emerald.500}',
      600: '{emerald.600}',
      700: '{emerald.700}',
      800: '{emerald.800}',
      900: '{emerald.900}',
      950: '{emerald.950}',
    },
  },
  {
    name: 'blue',
    color: '#3b82f6',
    palette: {
      50: '{blue.50}',
      100: '{blue.100}',
      200: '{blue.200}',
      300: '{blue.300}',
      400: '{blue.400}',
      500: '{blue.500}',
      600: '{blue.600}',
      700: '{blue.700}',
      800: '{blue.800}',
      900: '{blue.900}',
      950: '{blue.950}',
    },
  },
  {
    name: 'violet',
    color: '#8b5cf6',
    palette: {
      50: '{violet.50}',
      100: '{violet.100}',
      200: '{violet.200}',
      300: '{violet.300}',
      400: '{violet.400}',
      500: '{violet.500}',
      600: '{violet.600}',
      700: '{violet.700}',
      800: '{violet.800}',
      900: '{violet.900}',
      950: '{violet.950}',
    },
  },
  {
    name: 'rose',
    color: '#f43f5e',
    palette: {
      50: '{rose.50}',
      100: '{rose.100}',
      200: '{rose.200}',
      300: '{rose.300}',
      400: '{rose.400}',
      500: '{rose.500}',
      600: '{rose.600}',
      700: '{rose.700}',
      800: '{rose.800}',
      900: '{rose.900}',
      950: '{rose.950}',
    },
  },
]

/** PrimeVue のプライマリカラーをランタイムで切り替える */
export function applyPrimaryColor(name: ColorThemeName): void {
  const theme = COLOR_THEMES.find((t) => t.name === name)
  if (theme) updatePrimaryPalette(theme.palette)
}
