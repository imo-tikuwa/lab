import { defineStore } from 'pinia'
import { ref } from 'vue'
import { applyPrimaryColor } from '@/theme'
import type { ColorThemeName } from '@/theme'

export const useThemeStore = defineStore(
  'theme',
  () => {
    const primaryColor = ref<ColorThemeName>('emerald')

    function setPrimaryColor(name: ColorThemeName): void {
      primaryColor.value = name
      applyPrimaryColor(name)
    }

    return { primaryColor, setPrimaryColor }
  },
  {
    persist: {
      pick: ['primaryColor'],
    },
  },
)
