import { ref, computed, readonly } from 'vue'

export type ColorMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'lab-color-mode'

const colorMode = ref<ColorMode>((localStorage.getItem(STORAGE_KEY) as ColorMode | null) ?? 'system')

const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

function applyColorMode(mode: ColorMode): void {
  const dark = mode === 'dark' || (mode === 'system' && mediaQuery.matches)
  document.documentElement.classList.toggle('dark', dark)
}

applyColorMode(colorMode.value)

mediaQuery.addEventListener('change', () => {
  if (colorMode.value === 'system') applyColorMode('system')
})

export function useColorMode() {
  const isDark = computed(() => {
    if (colorMode.value === 'dark') return true
    if (colorMode.value === 'light') return false
    return mediaQuery.matches
  })

  function setColorMode(mode: ColorMode): void {
    colorMode.value = mode
    localStorage.setItem(STORAGE_KEY, mode)
    applyColorMode(mode)
  }

  function cycleColorMode(): void {
    const modes: ColorMode[] = ['light', 'dark', 'system']
    const idx = modes.indexOf(colorMode.value)
    setColorMode(modes[(idx + 1) % modes.length]!)
  }

  return { colorMode: readonly(colorMode), isDark, setColorMode, cycleColorMode }
}
