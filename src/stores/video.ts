import { defineStore } from 'pinia'
import type { Video, VideoJsonItem } from '@/types/video'

const base = import.meta.env.VITE_WORKER_BASE_URL ?? 'http://localhost:8787'

export const useVideoStore = defineStore(
  'video',
  () => {
    const currentView = ref<'list' | 'detail'>('list')
    const selectedProducts = ref<string[]>([])
    const selectedVideoPath = ref<string | null>(null)
    const videos = ref<Video[]>([])
    const isLoading = ref(false)

    async function fetchVideos(): Promise<void> {
      isLoading.value = true
      try {
        const res = await fetch(`${base}/videos.json`)
        const items: VideoJsonItem[] = await res.json()
        videos.value = items
          .map((v) => ({
            ...v,
            url: `${base}/${v.videoPath}`,
            thumbnailUrl: `${base}/${v.thumbnailPath}`,
          }))
          .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      } catch {
        videos.value = []
      } finally {
        isLoading.value = false
      }
    }

    const allProducts = computed(() => {
      const productSet = new Set<string>()
      videos.value.forEach((v) => productSet.add(v.product))
      return [...productSet].sort()
    })

    const filteredVideos = computed(() => {
      if (selectedProducts.value.length === 0) return videos.value
      return videos.value.filter((v) => selectedProducts.value.includes(v.product))
    })

    const selectedVideo = computed(() =>
      selectedVideoPath.value
        ? (videos.value.find((v) => v.videoPath === selectedVideoPath.value) ?? null)
        : null,
    )

    const relatedVideos = computed(() => {
      if (!selectedVideo.value) return []
      const product = selectedVideo.value.product
      return videos.value.filter(
        (v) => v.videoPath !== selectedVideo.value!.videoPath && v.product === product,
      )
    })

    function toggleProduct(product: string): void {
      const idx = selectedProducts.value.indexOf(product)
      if (idx === -1) selectedProducts.value.push(product)
      else selectedProducts.value.splice(idx, 1)
    }

    function clearProducts(): void {
      selectedProducts.value = []
    }

    function navigateToDetail(videoPath: string): void {
      selectedVideoPath.value = videoPath
      currentView.value = 'detail'
    }

    function navigateToList(): void {
      currentView.value = 'list'
    }

    fetchVideos()

    return {
      currentView,
      selectedProducts,
      selectedVideoPath,
      isLoading,
      allProducts,
      filteredVideos,
      selectedVideo,
      relatedVideos,
      toggleProduct,
      clearProducts,
      navigateToDetail,
      navigateToList,
    }
  },
  {
    persist: {
      storage: sessionStorage,
      pick: ['currentView', 'selectedProducts', 'selectedVideoPath'],
    },
  },
)
