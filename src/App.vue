<script setup lang="ts">
import { useColorMode } from '@/composables/color-mode'
import type { ColorMode } from '@/composables/color-mode'

import { usePageNavStore, PAGE_SECTION_ORDER } from '@/stores/page-nav'
import { useThemeStore } from '@/stores/theme'
import { useVideoStore } from '@/stores/video'
import { COLOR_THEMES, applyPrimaryColor } from '@/theme'

const { colorMode, isDark, setColorMode } = useColorMode()
const navStore = usePageNavStore()
const themeStore = useThemeStore()
const videoStore = useVideoStore()

// ページロード時に永続化されたプライマリカラーを適用
onMounted(() => {
  applyPrimaryColor(themeStore.primaryColor)
})

const dockItems = computed(() => [
  {
    icon: () => h('i', { class: 'pi pi-th-large text-lg text-surface-600 dark:text-surface-200' }),
    label: 'ポートフォリオ',
    onClick: () => navigateTo('portfolio'),
    className: `cursor-target${navStore.currentSection === 'portfolio' ? ' ring-2 ring-primary-400 dark:ring-primary-500' : ''}`,
  },
  {
    icon: () => h('i', { class: 'pi pi-history text-lg text-surface-600 dark:text-surface-200' }),
    label: 'タイムライン',
    onClick: () => navigateTo('timeline'),
    className: `cursor-target${navStore.currentSection === 'timeline' ? ' ring-2 ring-primary-400 dark:ring-primary-500' : ''}`,
  },
  {
    icon: () => h('i', { class: 'pi pi-user text-lg text-surface-600 dark:text-surface-200' }),
    label: 'プロフ',
    onClick: () => navigateTo('profile'),
    className: `cursor-target${navStore.currentSection === 'profile' ? ' ring-2 ring-primary-400 dark:ring-primary-500' : ''}`,
  },
  {
    icon: () => h('i', { class: 'pi pi-github text-lg text-surface-600 dark:text-surface-200' }),
    label: '統計',
    onClick: () => navigateTo('github'),
    className: `cursor-target${navStore.currentSection === 'github' ? ' ring-2 ring-primary-400 dark:ring-primary-500' : ''}`,
  },
  {
    icon: () => h('i', { class: 'pi pi-video text-lg text-surface-600 dark:text-surface-200' }),
    label: '動画',
    onClick: () => navigateTo('video'),
    className: `cursor-target${navStore.currentSection === 'video' ? ' ring-2 ring-primary-400 dark:ring-primary-500' : ''}`,
  },
])

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

// タッチデバイス判定（スマホ・タブレット等の pointer: coarse デバイス）
const isTouchDevice = window.matchMedia('(pointer: coarse)').matches

function navigateTo(section: Parameters<typeof navStore.navigate>[0]): void {
  if (section === 'video') videoStore.navigateToList()
  navStore.navigate(section)
  if (isTouchDevice) window.scrollTo(0, 0)
}
</script>

<template>
  <div class="min-h-screen">
    <TargetCursor v-if="!isTouchDevice" target-selector=".cursor-target" />

    <SquaresBackground
      class="fixed inset-0 -z-10"
      direction="diagonal"
      :speed="0.5"
      :border-color="squaresBorderColor"
      :hover-fill-color="squaresHoverFillColor"
      :gradient-color="squaresGradientColor"
    />

    <header class="px-6 py-2 border-b border-surface-200 dark:border-surface-700 bg-white/80 dark:bg-surface-950/80 backdrop-blur-sm flex items-center gap-1.5 sticky top-0 z-10">
      <span class="text-sm text-surface-400 dark:text-surface-500">imo-tikuwa's</span>
      <span class="text-sm font-bold text-surface-700 dark:text-surface-200">lab</span>

      <!-- デスクトップ用中央ナビゲーション -->
      <nav class="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
        <button
          v-for="item in dockItems"
          :key="item.label"
          class="cursor-target flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors focus:outline-none"
          :class="item.className.includes('ring-2') ? 'text-primary-500' : 'text-surface-500 dark:text-surface-400 hover:text-primary-500'"
          @click="item.onClick"
        >
          <component :is="item.icon" />
          {{ item.label }}
        </button>
      </nav>

      <div class="flex-1" />

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
            boxShadow: themeStore.primaryColor === theme.name ? `0 2px 8px ${theme.color}80` : `0 2px 8px ${theme.color}00`,
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
          :class="colorMode === option.value ? 'text-primary-500' : 'text-surface-500 dark:text-surface-400'"
          :title="option.value"
          @click="setColorMode(option.value)"
        >
          <i :class="option.icon" />
        </button>
      </div>
    </header>

    <div class="relative overflow-x-clip pb-32" style="padding-bottom: calc(8rem + env(safe-area-inset-bottom))">
      <Transition :name="transitionName" mode="out-in">
        <SectionPortfolio v-if="navStore.currentSection === 'portfolio'" key="portfolio" />
        <SectionTimeline v-else-if="navStore.currentSection === 'timeline'" key="timeline" />
        <SectionProfile v-else-if="navStore.currentSection === 'profile'" key="profile" />
        <SectionGitHub v-else-if="navStore.currentSection === 'github'" key="github" />
        <SectionVideo v-else key="video" />
      </Transition>
    </div>

    <!-- 画面下部固定 Dock ナビゲーション -->
    <div class="fixed bottom-0 left-0 right-0 z-50" style="padding-bottom: env(safe-area-inset-bottom)">
      <Dock :items="dockItems" :magnification="isTouchDevice ? 50 : 70" />
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
