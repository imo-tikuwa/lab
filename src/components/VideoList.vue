<script setup lang="ts">
import { motion } from 'motion-v'
import { useVideoStore } from '@/stores/video'
import { formatDuration } from '@/utils/video'

const videoStore = useVideoStore()
</script>

<template>
  <main class="max-w-screen-xl mx-auto px-6 py-8">
    <div class="bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm border border-surface-200/60 dark:border-surface-700/60 p-5">
      <div class="flex items-center gap-2 mb-4">
        <i class="pi pi-video text-surface-400 dark:text-surface-500" />
        <h2 class="text-base font-semibold text-surface-700 dark:text-surface-200">動画一覧</h2>
        <span class="text-xs text-surface-400 dark:text-surface-500">{{ videoStore.filteredVideos.length }} 件</span>
      </div>

      <div v-if="videoStore.allProducts.length" class="flex flex-wrap gap-1.5 mb-4">
        <Button
          label="すべて"
          size="small"
          :variant="videoStore.selectedProducts.length === 0 ? 'filled' : 'outlined'"
          class="cursor-target"
          @click="videoStore.clearProducts()"
        />
        <Button
          v-for="product in videoStore.allProducts"
          :key="product"
          :label="product"
          size="small"
          :variant="videoStore.selectedProducts.includes(product) ? 'filled' : 'outlined'"
          class="cursor-target"
          @click="videoStore.toggleProduct(product)"
        />
      </div>

      <div v-if="videoStore.isLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="i in 8"
          :key="i"
          class="border border-surface-200 dark:border-surface-700 overflow-hidden bg-white dark:bg-surface-900"
        >
          <Skeleton class="w-full aspect-video" />
          <div class="p-3 space-y-2">
            <Skeleton height="1.25rem" class="w-1/3" border-radius="1rem" />
            <Skeleton height="0.875rem" class="w-4/5 mt-1" />
            <Skeleton height="0.75rem" class="w-1/3 mt-1" />
          </div>
        </div>
      </div>

      <div v-else-if="videoStore.filteredVideos.length" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <motion.div
          v-for="(video, i) in videoStore.filteredVideos"
          :key="`video-${i}`"
          class="h-full"
          :initial="{ opacity: 0, y: 12 }"
          :while-in-view="{ opacity: 1, y: 0 }"
          :transition="{ duration: 0.35, delay: (i as number) * 0.05 }"
          :in-view-options="{ once: true }"
        >
          <div
            class="cursor-target cursor-pointer h-full flex flex-col border border-surface-200 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-sm transition-all group overflow-hidden bg-white dark:bg-surface-900"
            @click="videoStore.navigateToDetail(video.videoPath)"
          >
            <div class="relative bg-black aspect-video overflow-hidden">
              <img
                v-if="video.thumbnailUrl"
                :src="video.thumbnailUrl"
                :alt="video.title"
                class="w-full h-full object-contain"
              />
              <div v-else class="w-full h-full flex items-center justify-center">
                <i class="pi pi-video text-surface-600 dark:text-surface-500 text-3xl" />
              </div>
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <i class="pi pi-play-circle text-white text-3xl drop-shadow" />
              </div>
              <span class="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                {{ formatDuration(video.duration) }}
              </span>
            </div>
            <div class="p-3 flex-1 flex flex-col gap-1.5">
              <Badge :value="video.product" class="self-start" />
              <p class="text-sm font-medium text-surface-900 dark:text-surface-50 line-clamp-2 leading-snug">{{ video.title }}</p>
              <div v-if="video.tags.length" class="flex flex-wrap gap-1">
                <Badge v-for="tag in video.tags" :key="tag" :value="tag" severity="secondary" />
              </div>
              <span class="flex items-center gap-1 text-xs text-surface-400 dark:text-surface-500 mt-auto pt-0.5">
                <i class="pi pi-calendar" style="font-size: 0.6rem" />
                {{ video.publishedAt }}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <div v-else class="flex items-center justify-center py-24 text-surface-400 dark:text-surface-500">
        <span>動画がありません</span>
      </div>
    </div>
  </main>
</template>
