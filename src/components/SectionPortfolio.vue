<script setup lang="ts">
import { motion } from 'motion-v'
import { portfolioItems } from '@/data/portfolio-items'
import type { PortfolioItem } from '@/types/portfolio'
import { formatPeriod } from '@/utils/portfolio'
import { useColorMode } from '@/composables/color-mode'
import { useThemeStore } from '@/stores/theme'
import { usePortfolioStore, type LayoutType } from '@/stores/portfolio'
import { COLOR_THEMES } from '@/theme'

const portfolioStore = usePortfolioStore()
const { isDark } = useColorMode()
const themeStore = useThemeStore()

const loadedImages = ref<Set<string>>(new Set())
function onImageLoad(slug: string): void {
  loadedImages.value = new Set([...loadedImages.value, slug])
}

// モバイル（sm未満）ではリスト表示固定
const isSmallScreen = ref(window.matchMedia('(max-width: 639px)').matches)
const effectiveLayout = computed(() => (isSmallScreen.value ? 'list' : portfolioStore.layout))

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const spotlightColor = computed(() => {
  const theme = COLOR_THEMES.find((t) => t.name === themeStore.primaryColor)
  const hex = theme?.color ?? COLOR_THEMES[0]!.color
  return isDark.value ? hexToRgba(hex, 0.15) : hexToRgba(hex, 0.22)
})

const categoryOptions = ['すべて', 'GitHub Pages', 'サーバーレスアプリケーション', 'デスクトップアプリ', 'Chrome向けブラウザ拡張', 'ツール']

const layoutOptions: { value: LayoutType; icon: string }[] = [
  { value: 'list', icon: 'pi pi-list' },
  { value: 'grid', icon: 'pi pi-th-large' },
]

const filteredItems = computed(() => {
  const items = portfolioStore.selectedCategory === 'すべて' ? portfolioItems : portfolioItems.filter((item) => item.category.includes(portfolioStore.selectedCategory))
  return [...items].sort((a, b) => a.period_from.localeCompare(b.period_from) * portfolioStore.sortOrder)
})

function toggleSort(): void {
  portfolioStore.sortOrder = portfolioStore.sortOrder === 1 ? -1 : 1
}

function openExternalLink(item: PortfolioItem): void {
  const link = item.links?.find((l) => l.label === 'GitHub Pages')
  if (link) {
    window.open(link.url, '_blank', 'noopener,noreferrer')
  }
}

function hasExternalLink(item: PortfolioItem): boolean {
  return !!item.links?.some((l) => l.label === 'GitHub Pages')
}

function openItemScreenshots(item: PortfolioItem): void {
  if (item.screenshots.length) {
    portfolioStore.openScreenshotFor(item, 0)
  }
}

function limitedStacks(item: PortfolioItem): string[] {
  return [...item.stacks.languages, ...item.stacks.frameworks, ...item.stacks.libraries, ...item.stacks.tools, ...item.stacks.others].slice(0, 4)
}

function extraStackCount(item: PortfolioItem): number {
  const total = item.stacks.languages.length + item.stacks.frameworks.length + item.stacks.libraries.length + item.stacks.tools.length + item.stacks.others.length
  return total > 4 ? total - 4 : 0
}
</script>

<template>
  <main class="max-w-screen-xl mx-auto px-6 py-8">
    <div class="bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm border border-surface-200/60 dark:border-surface-700/60 p-5">
      <div class="flex items-center gap-2 mb-4">
        <i class="pi pi-th-large text-surface-400 dark:text-surface-500" />
        <h2 class="text-base font-semibold text-surface-700 dark:text-surface-200">ポートフォリオ一覧</h2>
        <span class="text-xs text-surface-400 dark:text-surface-500">{{ filteredItems.length }} 件</span>
      </div>
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
        <div class="flex items-center gap-2 flex-1 justify-between sm:justify-start">
          <Button
            :icon="portfolioStore.sortOrder === 1 ? 'pi pi-sort-amount-up-alt' : 'pi pi-sort-amount-down-alt'"
            :label="portfolioStore.sortOrder === 1 ? '古い順' : '新しい順'"
            variant="outlined"
            size="small"
            class="cursor-target shrink-0"
            @click="toggleSort"
          />
          <Select v-model="portfolioStore.selectedCategory" :options="categoryOptions" size="small" class="cursor-target flex-1 sm:flex-none sm:w-[190px]" />
        </div>
        <div class="cursor-target hidden sm:flex">
          <SelectButton v-model="portfolioStore.layout" :options="layoutOptions" option-value="value" :allow-empty="false">
            <template #option="{ option }">
              <i :class="option.icon" />
            </template>
          </SelectButton>
        </div>
      </div>

      <DataView :value="filteredItems" :layout="effectiveLayout" data-key="slug" :pt="{ content: { class: 'bg-transparent' } }">
        <template #list="{ items }">
          <div class="flex flex-col gap-3">
            <motion.div
              v-for="(item, i) in items"
              :key="item.slug"
              :initial="{ opacity: 0, y: 16 }"
              :while-in-view="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.4, delay: (i as number) * 0.06 }"
              :in-view-options="{ once: true }"
            >
              <SpotlightCard
                :spotlight-color="spotlightColor"
                class="flex flex-col sm:flex-row gap-4 p-5 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-sm transition-all"
              >
                <div
                  class="relative overflow-hidden rounded shrink-0 w-full sm:w-52 self-stretch min-h-32 sm:min-h-0"
                  :class="item.screenshots.length ? 'cursor-target cursor-pointer group' : ''"
                  @click.stop="openItemScreenshots(item)"
                >
                  <div v-if="!loadedImages.has(item.slug)" class="absolute inset-0">
                    <Skeleton width="100%" height="100%" border-radius="0" />
                  </div>
                  <img
                    :src="item.thumbnail"
                    :alt="`${item.title}のサムネイル`"
                    class="w-full h-full object-cover"
                    :class="item.screenshots.length ? 'transition-transform duration-300 group-hover:scale-110' : ''"
                    @load="onImageLoad(item.slug)"
                  />
                  <div v-if="item.screenshots.length" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <i class="pi pi-search text-white text-xl drop-shadow" />
                  </div>
                </div>
                <div class="flex flex-col flex-1 gap-2 min-w-0">
                  <div class="flex items-start justify-between gap-3">
                    <div class="flex flex-col gap-1.5 min-w-0">
                      <span class="text-base font-semibold text-surface-900 dark:text-surface-50 leading-snug">
                        {{ item.title }}
                      </span>
                      <div class="flex flex-wrap gap-1">
                        <Badge v-for="cat in item.category" :key="cat" :value="cat" severity="info" class="text-xs" />
                      </div>
                    </div>
                  </div>
                  <p class="text-sm text-surface-600 dark:text-surface-400 leading-relaxed line-clamp-2">
                    {{ item.summary }}
                  </p>
                  <div class="flex flex-wrap gap-1 mt-auto">
                    <Badge v-for="stack in limitedStacks(item)" :key="stack" :value="stack" severity="secondary" class="text-xs" />
                    <Badge v-if="extraStackCount(item) > 0" :value="`+${extraStackCount(item)}`" severity="secondary" class="text-xs" />
                  </div>
                  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
                    <span class="flex items-center gap-1.5 text-xs text-surface-400 dark:text-surface-500">
                      <i class="pi pi-calendar" style="font-size: 0.7rem" />
                      {{ formatPeriod(item.period_from, item.period_to) }}
                    </span>
                    <div class="flex items-center gap-2">
                      <Button
                        v-if="hasExternalLink(item)"
                        label="ページを見る"
                        icon="pi pi-external-link"
                        icon-pos="right"
                        size="small"
                        variant="outlined"
                        class="cursor-target flex-1 sm:flex-none"
                        @click.stop="openExternalLink(item)"
                      />
                      <Button
                        label="詳細を見る"
                        icon="pi pi-arrow-right"
                        icon-pos="right"
                        size="small"
                        variant="outlined"
                        class="cursor-target flex-1 sm:flex-none"
                        @click.stop="portfolioStore.openDetail(item)"
                      />
                    </div>
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          </div>
        </template>

        <template #grid="{ items }">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <motion.div
              v-for="(item, i) in items"
              :key="item.slug"
              :initial="{ opacity: 0, y: 16 }"
              :while-in-view="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.4, delay: (i as number) * 0.06 }"
              :in-view-options="{ once: true }"
            >
              <SpotlightCard
                :spotlight-color="spotlightColor"
                class="flex flex-col bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-sm transition-all h-full"
              >
                <div class="relative overflow-hidden h-40" :class="item.screenshots.length ? 'cursor-target cursor-pointer group' : ''" @click.stop="openItemScreenshots(item)">
                  <div v-if="!loadedImages.has(item.slug)" class="absolute inset-0">
                    <Skeleton width="100%" height="100%" border-radius="0" />
                  </div>
                  <img
                    :src="item.thumbnail"
                    :alt="`${item.title}のサムネイル`"
                    class="w-full h-40 object-cover"
                    :class="item.screenshots.length ? 'transition-transform duration-300 group-hover:scale-110' : ''"
                    @load="onImageLoad(item.slug)"
                  />
                  <div v-if="item.screenshots.length" class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <i class="pi pi-search text-white text-xl drop-shadow" />
                  </div>
                </div>
                <div class="flex flex-col flex-1 gap-2 p-4">
                  <div class="flex flex-wrap gap-1">
                    <Badge v-for="cat in item.category" :key="cat" :value="cat" severity="info" class="text-xs" />
                  </div>
                  <span class="text-sm font-semibold text-surface-900 dark:text-surface-50 leading-snug">
                    {{ item.title }}
                  </span>
                  <p class="text-xs text-surface-500 dark:text-surface-400 leading-relaxed line-clamp-3">
                    {{ item.summary }}
                  </p>
                  <div class="flex flex-wrap gap-1 mt-auto pt-1">
                    <Badge v-for="stack in limitedStacks(item)" :key="stack" :value="stack" severity="secondary" class="text-xs" />
                    <Badge v-if="extraStackCount(item) > 0" :value="`+${extraStackCount(item)}`" severity="secondary" class="text-xs" />
                  </div>
                  <span class="text-xs text-surface-400 dark:text-surface-500 flex items-center gap-1">
                    <i class="pi pi-calendar" style="font-size: 0.65rem" />
                    {{ formatPeriod(item.period_from, item.period_to) }}
                  </span>
                  <div class="flex items-center gap-2 pt-1">
                    <Button
                      v-if="hasExternalLink(item)"
                      label="ページを見る"
                      icon="pi pi-external-link"
                      icon-pos="right"
                      size="small"
                      variant="outlined"
                      class="cursor-target flex-1"
                      @click.stop="openExternalLink(item)"
                    />
                    <Button label="詳細を見る" icon="pi pi-arrow-right" icon-pos="right" size="small" variant="outlined" class="cursor-target flex-1" @click.stop="portfolioStore.openDetail(item)" />
                  </div>
                </div>
              </SpotlightCard>
            </motion.div>
          </div>
        </template>

        <template #empty>
          <div class="flex items-center justify-center py-12 text-surface-400 dark:text-surface-500">
            <span>該当するプロジェクトが見つかりません</span>
          </div>
        </template>
      </DataView>
    </div>

    <PortfolioDetailDrawer />
    <ScreenshotDrawer />
  </main>
</template>
