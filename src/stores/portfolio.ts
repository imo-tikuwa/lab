import { defineStore } from 'pinia'
import type { PortfolioItem } from '@/types/portfolio'

export type LayoutType = 'list' | 'grid'

export const usePortfolioStore = defineStore('portfolio', () => {
  const layout = ref<LayoutType>('list')
  const sortOrder = ref<1 | -1>(-1)
  const selectedCategory = ref('すべて')
  const detailVisible = ref(false)
  const selectedItem = ref<PortfolioItem | null>(null)
  const screenshotVisible = ref(false)
  const screenshotActiveIndex = ref(0)

  function openDetail(item: PortfolioItem): void {
    selectedItem.value = item
    detailVisible.value = true
  }

  function closeDetail(): void {
    detailVisible.value = false
    screenshotVisible.value = false
  }

  function openScreenshot(index: number): void {
    screenshotActiveIndex.value = index
    screenshotVisible.value = true
  }

  function openScreenshotFor(item: PortfolioItem, index: number): void {
    selectedItem.value = item
    screenshotActiveIndex.value = index
    screenshotVisible.value = true
  }

  function closeScreenshot(): void {
    screenshotVisible.value = false
  }

  return {
    layout,
    sortOrder,
    selectedCategory,
    detailVisible,
    selectedItem,
    screenshotVisible,
    screenshotActiveIndex,
    openDetail,
    closeDetail,
    openScreenshot,
    openScreenshotFor,
    closeScreenshot,
  }
})
