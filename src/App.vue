<script setup lang="ts">
import { useColorMode } from '@/composables/color-mode'
import type { ColorMode } from '@/composables/color-mode'

import { usePageNavStore, PAGE_SECTION_ORDER } from '@/stores/page-nav'
import type { PageSection } from '@/stores/page-nav'
import { useThemeStore } from '@/stores/theme'
import { COLOR_THEMES, applyPrimaryColor } from '@/theme'

const { colorMode, isDark, setColorMode } = useColorMode()
const navStore = usePageNavStore()
const themeStore = useThemeStore()

// ページロード時に永続化されたプライマリカラーを適用
onMounted(() => {
  applyPrimaryColor(themeStore.primaryColor)
})

type NavItem = { key: PageSection; label: string; icon: string }

const navItems: NavItem[] = [
  { key: 'portfolio', label: 'ポートフォリオ', icon: 'pi pi-th-large' },
  { key: 'profile', label: 'プロフ', icon: 'pi pi-user' },
  { key: 'github', label: '草', icon: 'pi pi-github' },
]

const transitionName = computed(() => {
  const prev = PAGE_SECTION_ORDER[navStore.previousSection]
  const curr = PAGE_SECTION_ORDER[navStore.currentSection]
  return prev <= curr ? 'slide-left' : 'slide-right'
})

const colorModeOptions: { value: ColorMode; icon: string }[] = [
  { value: 'light', icon: 'pi pi-sun' },
  { value: 'dark', icon: 'pi pi-moon' },
  { value: 'system', icon: 'pi pi-desktop' },
]

const squaresBorderColor = computed(() => (isDark.value ? '#334155' : '#cbd5e1'))
const squaresHoverFillColor = computed(() => (isDark.value ? '#1e293b' : '#e2e8f0'))
const squaresGradientColor = computed(() => (isDark.value ? '#0f172a' : '#f8fafc'))
</script>

<template>
  <div class="min-h-screen">
    <TargetCursor target-selector=".cursor-target" />

    <SquaresBackground
      class="fixed inset-0 -z-10"
      direction="diagonal"
      :speed="0.5"
      :border-color="squaresBorderColor"
      :hover-fill-color="squaresHoverFillColor"
      :gradient-color="squaresGradientColor"
    />

    <header
      class="px-6 py-2 border-b border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-950/80 backdrop-blur-sm flex items-center gap-1.5 sticky top-0 z-10"
    >
      <span class="text-sm text-surface-400 dark:text-surface-500">imo-tikuwa's</span>
      <span class="text-sm font-bold text-surface-700 dark:text-surface-200">lab</span>

      <nav class="flex-1 flex justify-center gap-1">
        <button
          v-for="item in navItems"
          :key="item.key"
          class="cursor-target flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors"
          :class="
            navStore.currentSection === item.key
              ? 'text-primary-500 bg-primary-50 dark:bg-primary-950/40'
              : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800'
          "
          @click="navStore.navigate(item.key)"
        >
          <i :class="item.icon" style="font-size: 0.8rem" />
          {{ item.label }}
        </button>
      </nav>

      <!-- プライマリカラー切り替えスウォッチ -->
      <div class="flex items-center gap-1.5">
        <button
          v-for="theme in COLOR_THEMES"
          :key="theme.name"
          class="cursor-target transition-all duration-300 hover:brightness-110 focus:outline-none"
          :style="{
            backgroundColor: theme.color,
            transform: 'skewX(-15deg)',
            width: themeStore.primaryColor === theme.name ? '2.625rem' : '1.75rem',
            height: themeStore.primaryColor === theme.name ? '1.75rem' : '1.5rem',
            boxShadow:
              themeStore.primaryColor === theme.name
                ? `0 2px 8px ${theme.color}80`
                : `0 2px 8px ${theme.color}00`,
          }"
          :title="theme.name"
          @click="themeStore.setPrimaryColor(theme.name)"
        />
      </div>

      <!-- 仕切り -->
      <div class="w-px h-5 bg-surface-200 dark:bg-surface-700 mx-1.5" />

      <!-- カラーモード切り替え -->
      <div class="flex items-center gap-0.5">
        <button
          v-for="option in colorModeOptions"
          :key="option.value"
          class="cursor-target w-7 h-6 flex items-center justify-center rounded transition-all focus:outline-none hover:bg-surface-100 dark:hover:bg-surface-800"
          :class="
            colorMode === option.value
              ? 'text-primary-500'
              : 'text-surface-500 dark:text-surface-400'
          "
          :title="option.value"
          @click="setColorMode(option.value)"
        >
          <i :class="option.icon" />
        </button>
      </div>
    </header>

    <div class="relative overflow-x-hidden">
      <Transition :name="transitionName" mode="out-in">
        <SectionPortfolio v-if="navStore.currentSection === 'portfolio'" key="portfolio" />
        <SectionProfile v-else-if="navStore.currentSection === 'profile'" key="profile" />
        <SectionGitHub v-else key="github" />
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 0.3s ease,
    opacity 0.3s ease;
}

.slide-left-enter-from {
  transform: translateX(40px);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-40px);
  opacity: 0;
}

.slide-right-enter-from {
  transform: translateX(-40px);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(40px);
  opacity: 0;
}
</style>
