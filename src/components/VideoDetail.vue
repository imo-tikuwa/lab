<script setup lang="ts">
import { motion } from 'motion-v'
import { useVideoStore } from '@/stores/video'
import { formatDuration } from '@/utils/video'

const videoStore = useVideoStore()
const videoRef = ref<HTMLVideoElement | null>(null)

function loadAndPlay(): void {
  if (videoRef.value) {
    videoRef.value.load()
    videoRef.value.play().catch(() => {})
  }
}

onMounted(loadAndPlay)

watch(
  () => videoStore.selectedVideoPath,
  async () => {
    await nextTick()
    loadAndPlay()
  },
)
</script>

<template>
  <main class="max-w-screen-xl mx-auto px-6 py-8">
    <div class="bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm border border-surface-200/60 dark:border-surface-700/60 p-5">
      <!-- パンくず -->
      <nav class="flex items-center gap-2 text-sm mb-5">
        <button
          class="cursor-target text-primary-500 hover:underline focus:outline-none shrink-0"
          @click="videoStore.navigateToList()"
        >
          動画一覧
        </button>
        <i class="pi pi-angle-right text-surface-400 dark:text-surface-500 text-xs shrink-0" />
        <span class="text-surface-600 dark:text-surface-400 truncate">
          {{ videoStore.selectedVideo ? `${videoStore.selectedVideo.product} / ${videoStore.selectedVideo.title}` : '' }}
        </span>
      </nav>

      <!-- プレイヤー + 動画情報 -->
      <div class="flex gap-6 items-start mb-6">
        <!-- 左: プレイヤー -->
        <div class="shrink-0">
          <div class="cursor-restore bg-black flex items-center justify-center" style="width: 720px; height: 480px;">
            <video
              v-if="videoStore.selectedVideo"
              ref="videoRef"
              controls
              controlslist="nodownload"
              class="w-full h-full"
              style="object-fit: contain;"
              :src="videoStore.selectedVideo.url"
              @contextmenu.prevent
            />
          </div>
        </div>

        <!-- 右: 動画情報パネル -->
        <div class="flex-1 min-w-0 border-l border-surface-200/60 dark:border-surface-700/60 pl-5 space-y-3">
          <Badge v-if="videoStore.selectedVideo" :value="videoStore.selectedVideo.product" class="self-start" />
          <h1 class="text-base font-semibold text-surface-900 dark:text-surface-50 leading-snug">
            {{ videoStore.selectedVideo?.title }}
          </h1>
          <div class="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400 flex-wrap">
            <span class="flex items-center gap-1.5">
              <i class="pi pi-clock" />
              {{ formatDuration(videoStore.selectedVideo?.duration ?? 0) }}
            </span>
            <span class="text-surface-300 dark:text-surface-600">·</span>
            <span class="flex items-center gap-1.5">
              <i class="pi pi-calendar" />
              {{ videoStore.selectedVideo?.publishedAt }}
            </span>
            <span class="text-surface-300 dark:text-surface-600">·</span>
            <span class="flex items-center gap-1.5">
              <i class="pi pi-desktop" />
              {{ videoStore.selectedVideo?.width }} × {{ videoStore.selectedVideo?.height }}
            </span>
          </div>
          <p
            v-if="videoStore.selectedVideo?.description"
            class="text-sm text-surface-500 dark:text-surface-400 leading-relaxed whitespace-pre-line"
          >
            {{ videoStore.selectedVideo.description }}
          </p>
          <div v-if="videoStore.selectedVideo?.tags.length" class="flex flex-wrap gap-1">
            <Badge
              v-for="tag in videoStore.selectedVideo.tags"
              :key="tag"
              :value="tag"
              severity="secondary"
            />
          </div>
        </div>
      </div>

      <!-- 同じ作品の別動画 -->
      <template v-if="videoStore.relatedVideos.length">
        <div class="border-t border-surface-200/60 dark:border-surface-700/60 pt-5">
          <h2 class="text-sm font-semibold text-surface-700 dark:text-surface-200 mb-3 flex items-center gap-2">
            <i class="pi pi-list text-surface-400" />
            同じ作品の動画
          </h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            <motion.div
              v-for="(video, i) in videoStore.relatedVideos"
              :key="`video-${i}`"
              class="h-full"
              :initial="{ opacity: 0, y: 12 }"
              :while-in-view="{ opacity: 1, y: 0 }"
              :transition="{ duration: 0.35, delay: (i as number) * 0.05 }"
              :in-view-options="{ once: true }"
            >
              <div
                class="cursor-target cursor-pointer h-full flex flex-col border border-surface-200 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500 transition-all group overflow-hidden"
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
                    <i class="pi pi-video text-surface-600 dark:text-surface-500 text-xl" />
                  </div>
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <i class="pi pi-play-circle text-white text-2xl drop-shadow" />
                  </div>
                  <span class="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded">
                    {{ formatDuration(video.duration) }}
                  </span>
                </div>
                <div class="p-2 flex-1 flex flex-col gap-1">
                  <p class="text-xs font-medium text-surface-900 dark:text-surface-50 line-clamp-2 leading-snug">{{ video.title }}</p>
                  <div v-if="video.tags.length" class="flex flex-wrap gap-1">
                    <Badge v-for="tag in video.tags" :key="tag" :value="tag" severity="secondary" class="text-[0.65rem]" />
                  </div>
                  <span class="flex items-center gap-1 text-xs text-surface-400 dark:text-surface-500 mt-auto pt-0.5">
                    <i class="pi pi-calendar" style="font-size: 0.6rem" />
                    {{ video.publishedAt }}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </template>
    </div>
  </main>
</template>
