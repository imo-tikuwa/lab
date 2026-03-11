<script setup lang="ts">
import type { PortfolioScreenshot } from '@/types/portfolio'

const props = defineProps<{
  visible: boolean
  screenshots: PortfolioScreenshot[]
  activeIndex: number
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'update:activeIndex': [value: number]
}>()

const internalVisible = computed({
  get: () => props.visible,
  set: (val: boolean) => emit('update:visible', val),
})

const internalActiveIndex = computed({
  get: () => props.activeIndex,
  set: (val: number) => emit('update:activeIndex', val),
})

function prev(): void {
  const len = props.screenshots.length
  internalActiveIndex.value = (internalActiveIndex.value - 1 + len) % len
}

function next(): void {
  const len = props.screenshots.length
  internalActiveIndex.value = (internalActiveIndex.value + 1) % len
}

const currentItem = computed(() => props.screenshots[internalActiveIndex.value] ?? null)
</script>

<template>
  <Drawer
    v-model:visible="internalVisible"
    position="left"
    style="width: min(95vw, 700px)"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-images text-primary-500" />
        <span class="font-bold text-surface-800 dark:text-surface-100">スクリーンショット</span>
        <span class="text-sm text-surface-400 dark:text-surface-500 ml-1">
          {{ internalActiveIndex + 1 }} / {{ screenshots.length }}
        </span>
      </div>
    </template>

    <div v-if="currentItem" class="flex flex-col gap-4 h-full">
      <!-- メイン画像エリア -->
      <div class="relative flex items-center justify-center bg-surface-100 dark:bg-surface-800 rounded-lg overflow-hidden" style="height: 420px">
        <img
          :src="currentItem.itemImageSrc"
          :alt="currentItem.alt"
          class="max-w-full max-h-full object-contain"
        />
        <!-- 前へ/次へボタン -->
        <button
          v-if="screenshots.length > 1"
          class="absolute left-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          @click="prev"
        >
          <i class="pi pi-chevron-left" />
        </button>
        <button
          v-if="screenshots.length > 1"
          class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
          @click="next"
        >
          <i class="pi pi-chevron-right" />
        </button>
      </div>

      <!-- サムネイル一覧 -->
      <div v-if="screenshots.length > 1" class="flex gap-2 flex-wrap">
        <img
          v-for="(ss, index) in screenshots"
          :key="ss.thumbnailImageSrc"
          :src="ss.thumbnailImageSrc"
          :alt="ss.alt"
          class="h-16 w-24 object-cover rounded cursor-pointer transition-all"
          :class="index === internalActiveIndex
            ? 'ring-2 ring-primary-500 opacity-100'
            : 'opacity-60 hover:opacity-100'"
          @click="internalActiveIndex = index"
        />
      </div>
    </div>
  </Drawer>
</template>
