<script setup lang="ts">
import { useColorMode } from '@/composables/color-mode'
import { useThemeStore } from '@/stores/theme'
import { COLOR_THEMES } from '@/theme'

const { isDark } = useColorMode()
const themeStore = useThemeStore()

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

// 現在のプライマリカラーに合わせたスポットライト色
const spotlightColor = computed(() => {
  const theme = COLOR_THEMES.find((t) => t.name === themeStore.primaryColor)
  const hex = theme?.color ?? COLOR_THEMES[0]!.color
  return isDark.value ? hexToRgba(hex, 0.15) : hexToRgba(hex, 0.22)
})

interface ArticleItem {
  id: string
  title: string
  url: string
  created_at: string
  tags: string[]
  source: 'qiita' | 'zenn'
  likes_count: number
}

interface TagWithCount {
  name: string
  count: number
}

interface PopoverInstance {
  toggle: (event: MouseEvent) => void
}

const socialLinks = [
  { href: 'https://x.com/imo-tikuwa', icon: 'pi pi-twitter', label: 'X / Twitter' },
  { href: 'https://github.com/imo-tikuwa', icon: 'pi pi-github', label: 'GitHub' },
  { href: 'https://qiita.com/imo_tikuwa', icon: 'pi pi-pencil', label: 'Qiita' },
  { href: 'https://zenn.dev/imo_tikuwa', icon: 'pi pi-book', label: 'Zenn' },
] as const

const articles = ref<ArticleItem[]>([])
const loading = ref(false)
const selectedTags = ref<string[]>([])
const popoverRef = ref<PopoverInstance | null>(null)

// タグを記事出現数の多い順にソート
const allTagsSorted = computed<TagWithCount[]>(() => {
  const countMap = new Map<string, number>()
  articles.value.forEach((a) => {
    a.tags.forEach((t) => {
      countMap.set(t, (countMap.get(t) ?? 0) + 1)
    })
  })
  return [...countMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, count }))
})

const filteredArticles = computed<ArticleItem[]>(() => {
  if (selectedTags.value.length === 0) return articles.value
  return articles.value.filter((a) => selectedTags.value.some((t) => a.tags.includes(t)))
})

function toggleFilter(event: MouseEvent): void {
  popoverRef.value?.toggle(event)
}

function toggleTag(tag: string): void {
  const idx = selectedTags.value.indexOf(tag)
  if (idx === -1) {
    selectedTags.value = [...selectedTags.value, tag]
  } else {
    selectedTags.value = selectedTags.value.filter((t) => t !== tag)
  }
}

function clearTags(): void {
  selectedTags.value = []
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`
}

async function fetchArticles(): Promise<void> {
  loading.value = true
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/articles.json`)
    if (!res.ok) return
    const data: ArticleItem[] = await res.json()
    articles.value = data
  } finally {
    loading.value = false
  }
}

onMounted(fetchArticles)
</script>

<template>
  <main class="max-w-screen-xl mx-auto px-6 py-8">
    <!-- プロフィールカード -->
    <div
      class="bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm border border-surface-200/60 dark:border-surface-700/60 rounded-lg p-6 mb-8"
    >
      <div class="flex flex-col sm:flex-row gap-6 items-start">
        <!-- アバター -->
        <img
          src="https://github.com/imo-tikuwa.png"
          alt="imo-tikuwa"
          class="w-20 h-20 rounded-full border-2 border-surface-200 dark:border-surface-600 shrink-0"
        />

        <div class="flex flex-col gap-4 flex-1">
          <!-- 名前・自己紹介 -->
          <div class="flex flex-col gap-1.5">
            <span class="text-xl font-bold text-surface-900 dark:text-surface-50">imo-tikuwa</span>
            <p class="text-sm text-surface-600 dark:text-surface-400 leading-relaxed">
              会社員PGとして約10年経験を積み、現在はフリーランスエンジニアとして活動中。<br />
              フロントエンド・バックエンド・インフラと、領域を問わず幅広く対応しています。
            </p>
          </div>

          <!-- SNS リンク -->
          <div class="flex flex-wrap gap-2">
            <a
              v-for="link in socialLinks"
              :key="link.href"
              :href="link.href"
              target="_blank"
              rel="noopener noreferrer"
              class="cursor-target inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-surface-300 dark:border-surface-600 rounded text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 hover:border-surface-400 dark:hover:border-surface-500 transition-colors"
            >
              <i :class="link.icon" style="font-size: 0.8rem" />
              {{ link.label }}
            </a>
          </div>

          <!-- スキルセット -->
          <div class="flex flex-col gap-2">
            <div class="flex flex-wrap gap-1.5 items-center">
              <span
                class="text-xs text-surface-400 dark:text-surface-500 whitespace-nowrap shrink-0 w-[4.5rem]"
                >日常的に使用</span
              >
              <Badge
                v-for="skill in ['Vue 3', 'Nuxt', 'TypeScript', 'Docker', 'AWS']"
                :key="skill"
                :value="skill"
                severity="info"
                class="text-xs"
              />
            </div>
            <div class="flex flex-wrap gap-1.5 items-center">
              <span
                class="text-xs text-surface-400 dark:text-surface-500 whitespace-nowrap shrink-0 w-[4.5rem]"
                >経験あり</span
              >
              <Badge
                v-for="skill in ['PHP', 'Laravel', 'Java', 'MySQL', 'PostgreSQL', 'Node.js', 'Electron']"
                :key="skill"
                :value="skill"
                severity="secondary"
                class="text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 記事・スクラップ一覧 -->
    <div
      class="bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm rounded-lg border border-surface-200/60 dark:border-surface-700/60 px-6 py-5"
    >
      <!-- ヘッダー行：タイトル左 / フィルター右（デスクトップ） -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div class="flex items-center gap-2">
          <i class="pi pi-book text-surface-400 dark:text-surface-500" />
          <h2 class="text-base font-semibold text-surface-700 dark:text-surface-200">
            記事・スクラップ
          </h2>
          <span v-if="!loading" class="text-xs text-surface-400 dark:text-surface-500">
            {{ filteredArticles.length }} 件
          </span>
        </div>

        <!-- タグフィルター操作（タグ表示 → クリア → 絞り込むボタン の順で右端固定） -->
        <div v-if="allTagsSorted.length > 0" class="flex flex-wrap items-center gap-2">
          <div v-if="selectedTags.length > 0" class="flex flex-wrap gap-x-2 gap-y-0.5">
            <span
              v-for="tag in selectedTags.slice(0, 5)"
              :key="tag"
              class="text-xs text-primary-500 dark:text-primary-400"
            >#{{ tag }}</span>
            <span
              v-if="selectedTags.length > 5"
              class="text-xs text-surface-400 dark:text-surface-500"
              >+{{ selectedTags.length - 5 }}</span
            >
          </div>
          <Button
            v-if="selectedTags.length > 0"
            class="cursor-target"
            size="small"
            variant="text"
            severity="secondary"
            icon="pi pi-times"
            label="クリア"
            @click="clearTags"
          />
          <Button
            class="cursor-target"
            size="small"
            variant="outlined"
            :icon="selectedTags.length > 0 ? 'pi pi-filter-fill' : 'pi pi-filter'"
            :label="selectedTags.length > 0 ? `絞り込み中 (${selectedTags.length})` : '絞り込む'"
            @click="toggleFilter"
          />
        </div>
      </div>

      <!-- タグフィルター Popover -->
      <Popover ref="popoverRef">
        <div class="p-3 w-[500px] max-w-[calc(100vw-2rem)]">
          <p class="text-xs text-surface-400 dark:text-surface-500 mb-2.5">
            頻出順 · クリックで絞り込み
          </p>
          <div class="grid grid-cols-3 gap-1.5 max-h-72 overflow-y-auto pr-0.5">
            <button
              v-for="tag in allTagsSorted"
              :key="tag.name"
              class="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded text-xs border transition-colors text-left"
              :class="
                selectedTags.includes(tag.name)
                  ? 'bg-primary-500 border-primary-500 text-white'
                  : 'bg-surface-100 dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:border-primary-400 dark:hover:border-primary-500'
              "
              @click="toggleTag(tag.name)"
            >
              <span class="truncate">{{ tag.name }}</span>
              <span
                class="shrink-0 tabular-nums text-[0.65rem]"
                :class="selectedTags.includes(tag.name) ? 'text-white/70' : 'text-surface-400 dark:text-surface-500'"
                >{{ tag.count }}</span
              >
            </button>
          </div>
        </div>
      </Popover>

      <!-- ローディング スケルトン -->
      <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <Skeleton v-for="n in 9" :key="n" height="116px" border-radius="8px" />
      </div>

      <!-- 記事グリッド -->
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <SpotlightCard
          v-for="article in filteredArticles"
          :key="article.id"
          :spotlight-color="spotlightColor"
          class="cursor-target bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-sm transition-all"
        >
          <a
            :href="article.url"
            target="_blank"
            rel="noopener noreferrer"
            class="flex flex-col gap-2.5 p-4 h-full"
          >
            <div class="flex items-center justify-between gap-2">
              <Badge
                :value="article.source === 'qiita' ? 'Qiita' : 'Zenn'"
                :severity="article.source === 'qiita' ? 'success' : 'info'"
                class="text-xs shrink-0"
              />
              <span class="text-xs text-surface-400 dark:text-surface-500 shrink-0">
                {{ formatDate(article.created_at) }}
              </span>
            </div>
            <span
              class="text-sm font-medium text-surface-900 dark:text-surface-50 leading-snug line-clamp-2 flex-1"
            >
              {{ article.title }}
            </span>
            <div v-if="article.tags.length > 0" class="flex flex-wrap gap-x-2 gap-y-0.5">
              <span
                v-for="tag in article.tags.slice(0, 3)"
                :key="tag"
                class="text-xs text-primary-500 dark:text-primary-400"
              >#{{ tag }}</span>
              <span
                v-if="article.tags.length > 3"
                class="text-xs text-surface-400 dark:text-surface-500"
                >+{{ article.tags.length - 3 }}</span
              >
            </div>
          </a>
        </SpotlightCard>
      </div>

      <!-- 空状態 -->
      <div
        v-if="!loading && filteredArticles.length === 0"
        class="flex items-center justify-center py-12 text-surface-400 dark:text-surface-500 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg"
      >
        <span class="text-sm">該当する記事が見つかりません</span>
      </div>
    </div>
  </main>
</template>
