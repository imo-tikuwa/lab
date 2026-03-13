<script setup lang="ts">
import { portfolioItems } from '@/data/portfolio-items'
import type { PortfolioItem } from '@/types/portfolio'
import { formatPeriod } from '@/utils/portfolio'

type LayoutType = 'list' | 'grid'

const layout = ref<LayoutType>('list')
const sortOrder = ref<1 | -1>(-1)
const selectedCategory = ref('すべて')
const detailVisible = ref(false)
const selectedItem = ref<PortfolioItem | null>(null)

const categoryOptions = [
  'すべて',
  'GitHub Pages',
  'サーバーレスアプリケーション',
  'デスクトップアプリ',
  'Chrome向けブラウザ拡張',
  'ツール',
]

const layoutOptions: { value: LayoutType; icon: string }[] = [
  { value: 'list', icon: 'pi pi-list' },
  { value: 'grid', icon: 'pi pi-th-large' },
]

const filteredItems = computed(() => {
  const items =
    selectedCategory.value === 'すべて'
      ? portfolioItems
      : portfolioItems.filter((item) => item.category.includes(selectedCategory.value))
  return [...items].sort((a, b) => a.period_from.localeCompare(b.period_from) * sortOrder.value)
})

function toggleSort(): void {
  sortOrder.value = sortOrder.value === 1 ? -1 : 1
}

function handleItemClick(item: PortfolioItem): void {
  selectedItem.value = item
  detailVisible.value = true
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

function limitedStacks(item: PortfolioItem): string[] {
  return [
    ...item.stacks.languages,
    ...item.stacks.frameworks,
    ...item.stacks.libraries,
    ...item.stacks.tools,
    ...item.stacks.others,
  ].slice(0, 4)
}

function extraStackCount(item: PortfolioItem): number {
  const total =
    item.stacks.languages.length +
    item.stacks.frameworks.length +
    item.stacks.libraries.length +
    item.stacks.tools.length +
    item.stacks.others.length
  return total > 4 ? total - 4 : 0
}
</script>

<template>
  <main class="max-w-screen-xl mx-auto px-6 py-8">
    <div class="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
      <div class="flex items-center gap-2 flex-1">
        <Button
          :icon="sortOrder === 1 ? 'pi pi-sort-amount-up-alt' : 'pi pi-sort-amount-down-alt'"
          :label="sortOrder === 1 ? '開始日: 古い順' : '開始日: 新しい順'"
          variant="outlined"
          size="small"
          class="cursor-target !bg-white dark:!bg-surface-900"
          @click="toggleSort"
        />
        <Select
          v-model="selectedCategory"
          :options="categoryOptions"
          size="small"
          class="cursor-target w-[190px]"
        />
      </div>
      <div class="cursor-target">
        <SelectButton
          v-model="layout"
          :options="layoutOptions"
          option-value="value"
          :allow-empty="false"
        >
          <template #option="{ option }">
            <i :class="option.icon" />
          </template>
        </SelectButton>
      </div>
    </div>

    <DataView :value="filteredItems" :layout="layout" data-key="slug">
      <template #list="{ items }">
        <div
          class="flex flex-col divide-y divide-surface-200 dark:divide-surface-700 border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900"
        >
          <div
            v-for="item in items"
            :key="item.slug"
            class="flex flex-col sm:flex-row gap-4 p-5 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
          >
            <img
              :src="item.thumbnail"
              :alt="`${item.title}のサムネイル`"
              class="w-full sm:w-44 h-28 object-cover rounded shrink-0"
            />
            <div class="flex flex-col flex-1 gap-2 min-w-0">
              <div class="flex items-start justify-between gap-3">
                <div class="flex flex-col gap-1.5 min-w-0">
                  <span
                    class="text-base font-semibold text-surface-900 dark:text-surface-50 leading-snug"
                  >
                    {{ item.title }}
                  </span>
                  <div class="flex flex-wrap gap-1">
                    <Badge
                      v-for="cat in item.category"
                      :key="cat"
                      :value="cat"
                      severity="info"
                      class="text-xs"
                    />
                  </div>
                </div>
              </div>
              <p
                class="text-sm text-surface-600 dark:text-surface-400 leading-relaxed line-clamp-2"
              >
                {{ item.summary }}
              </p>
              <div class="flex flex-wrap gap-1 mt-auto">
                <Badge
                  v-for="stack in limitedStacks(item)"
                  :key="stack"
                  :value="stack"
                  severity="secondary"
                  class="text-xs"
                />
                <Badge
                  v-if="extraStackCount(item) > 0"
                  :value="`+${extraStackCount(item)}`"
                  severity="secondary"
                  class="text-xs"
                />
              </div>
              <div class="flex items-center justify-between pt-1">
                <span
                  class="flex items-center gap-1.5 text-xs text-surface-400 dark:text-surface-500"
                >
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
                    class="cursor-target"
                    @click.stop="openExternalLink(item)"
                  />
                  <Button
                    label="詳細を見る"
                    icon="pi pi-arrow-right"
                    icon-pos="right"
                    size="small"
                    variant="outlined"
                    class="cursor-target"
                    @click.stop="handleItemClick(item)"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #grid="{ items }">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div
            v-for="item in items"
            :key="item.slug"
            class="flex flex-col bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden hover:shadow-md transition-all"
          >
            <img
              :src="item.thumbnail"
              :alt="`${item.title}のサムネイル`"
              class="w-full h-40 object-cover"
            />
            <div class="flex flex-col flex-1 gap-2 p-4">
              <div class="flex flex-wrap gap-1">
                <Badge
                  v-for="cat in item.category"
                  :key="cat"
                  :value="cat"
                  severity="info"
                  class="text-xs"
                />
              </div>
              <span
                class="text-sm font-semibold text-surface-900 dark:text-surface-50 leading-snug"
              >
                {{ item.title }}
              </span>
              <p
                class="text-xs text-surface-500 dark:text-surface-400 leading-relaxed line-clamp-3"
              >
                {{ item.summary }}
              </p>
              <div class="flex flex-wrap gap-1 mt-auto pt-1">
                <Badge
                  v-for="stack in limitedStacks(item)"
                  :key="stack"
                  :value="stack"
                  severity="secondary"
                  class="text-xs"
                />
                <Badge
                  v-if="extraStackCount(item) > 0"
                  :value="`+${extraStackCount(item)}`"
                  severity="secondary"
                  class="text-xs"
                />
              </div>
              <span
                class="text-xs text-surface-400 dark:text-surface-500 flex items-center gap-1"
              >
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
                <Button
                  label="詳細を見る"
                  icon="pi pi-arrow-right"
                  icon-pos="right"
                  size="small"
                  variant="outlined"
                  class="cursor-target flex-1"
                  @click.stop="handleItemClick(item)"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #empty>
        <div
          class="flex items-center justify-center py-12 text-surface-400 dark:text-surface-500 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700"
        >
          <span>該当するプロジェクトが見つかりません</span>
        </div>
      </template>
    </DataView>

    <PortfolioDetailDrawer v-model:visible="detailVisible" :item="selectedItem" />
  </main>
</template>
