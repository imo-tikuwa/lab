<script setup lang="ts">
import { useResizeObserver } from '@vueuse/core'
import { usePortfolioStore } from '@/stores/portfolio'

const portfolioStore = usePortfolioStore()

const containerRef = ref<HTMLDivElement | null>(null)
const containerWidth = ref(600)
const displayX = ref(0)
const isTransitioning = ref(false)

const screenshots = computed(() => portfolioStore.selectedItem?.screenshots ?? [])
const total = computed(() => screenshots.value.length)

useResizeObserver(containerRef, ([entry]) => {
  const w = entry?.contentRect.width ?? 0
  if (w > 0) {
    containerWidth.value = w
    snapToIndex(portfolioStore.screenshotActiveIndex, w)
  }
})

watch(
  () => portfolioStore.screenshotVisible,
  (visible) => {
    if (visible) {
      nextTick(() => {
        const w = containerRef.value?.offsetWidth ?? containerWidth.value
        if (w > 0) containerWidth.value = w
        snapToIndex(portfolioStore.screenshotActiveIndex, containerWidth.value)
      })
    }
  },
)

watch(
  () => portfolioStore.screenshotActiveIndex,
  (idx) => {
    goTo(idx)
  },
)

function snapToIndex(idx: number, w = containerWidth.value): void {
  isTransitioning.value = false
  displayX.value = -idx * w
}

function goTo(idx: number): void {
  isTransitioning.value = true
  displayX.value = -idx * containerWidth.value
}

// Drag state
let isDragging = false
let pointerStartX = 0
let dragBaseX = 0
let activePointerId: number | null = null

function onPointerDown(e: PointerEvent): void {
  if (activePointerId !== null) return
  e.preventDefault()
  activePointerId = e.pointerId
  isDragging = true
  isTransitioning.value = false
  pointerStartX = e.clientX
  dragBaseX = displayX.value
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
}

function onPointerMove(e: PointerEvent): void {
  if (!isDragging || e.pointerId !== activePointerId) return
  displayX.value = dragBaseX + (e.clientX - pointerStartX)
}

function onPointerUp(e: PointerEvent): void {
  if (!isDragging || e.pointerId !== activePointerId) return
  activePointerId = null
  isDragging = false
  const delta = e.clientX - pointerStartX
  const threshold = containerWidth.value * 0.2
  const idx = portfolioStore.screenshotActiveIndex
  let newIndex = idx
  if (delta < -threshold && idx < total.value - 1) newIndex = idx + 1
  else if (delta > threshold && idx > 0) newIndex = idx - 1
  portfolioStore.screenshotActiveIndex = newIndex
  isTransitioning.value = true
  displayX.value = -newIndex * containerWidth.value
}
</script>

<template>
  <Drawer
    :visible="portfolioStore.screenshotVisible"
    position="left"
    style="width: min(90vw, 860px)"
    :pt="{ pcCloseButton: { root: { class: 'cursor-target' } } }"
    @update:visible="(v) => !v && portfolioStore.closeScreenshot()"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-images text-primary-500" />
        <span class="font-bold text-surface-800 dark:text-surface-100">スクリーンショット</span>
        <span v-if="total > 0" class="text-sm text-surface-400 dark:text-surface-500 ml-1"> {{ portfolioStore.screenshotActiveIndex + 1 }} / {{ total }} </span>
      </div>
    </template>

    <div v-if="total > 0" class="flex flex-col gap-4 h-full select-none">
      <!-- カルーセル -->
      <div
        ref="containerRef"
        class="relative overflow-hidden bg-surface-100 dark:bg-surface-800 flex-1 min-h-0 max-h-[40vh] sm:max-h-none"
        style="touch-action: none"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      >
        <div
          class="flex h-full"
          :style="{
            width: `${total * containerWidth}px`,
            transform: `translateX(${displayX}px)`,
            transition: isTransitioning ? 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
            willChange: 'transform',
            cursor: isDragging ? 'grabbing' : 'grab',
          }"
        >
          <div v-for="(ss, i) in screenshots" :key="i" class="flex items-center justify-center shrink-0 h-full" :style="{ width: `${containerWidth}px` }">
            <img :src="ss.itemImageSrc" :alt="ss.alt ?? ''" class="max-w-full max-h-full object-contain pointer-events-none" draggable="false" />
          </div>
        </div>
      </div>

      <!-- サムネイルナビゲーション -->
      <div v-if="total > 1" class="pb-24">
        <div class="flex flex-nowrap sm:flex-wrap sm:justify-center gap-2 overflow-x-auto p-1 pb-2 sm:p-1">
          <img
            v-for="(ss, i) in screenshots"
            :key="ss.thumbnailImageSrc"
            :src="ss.thumbnailImageSrc"
            :alt="ss.alt ?? ''"
            class="cursor-target h-16 w-24 object-cover cursor-pointer transition-all duration-200 shrink-0"
            :class="i === portfolioStore.screenshotActiveIndex ? 'outline outline-2 outline-primary-500 opacity-100' : 'opacity-50 hover:opacity-80'"
            draggable="false"
            @click="portfolioStore.screenshotActiveIndex = i"
          />
        </div>
        <p class="sm:hidden mt-1 text-xs text-surface-400 dark:text-surface-500">← 横にスクロールできます</p>
      </div>
    </div>
  </Drawer>
</template>
