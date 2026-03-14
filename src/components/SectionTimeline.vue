<script setup lang="ts">
import { motion } from 'motion-v'
import { timelineItems } from '@/data/timeline-items'
import type { TimelineItem } from '@/data/timeline-items'
import { useThemeStore } from '@/stores/theme'
import { COLOR_THEMES } from '@/theme'

const themeStore = useThemeStore()

const spotlightColor = computed(() => {
  const theme = COLOR_THEMES.find((t) => t.name === themeStore.primaryColor)
  const hex = theme?.color ?? COLOR_THEMES[0]!.color
  return `${hex}26`
})

function formatPeriod(from: string, to: string | null): string {
  return to === null ? `${from} 〜 現在` : `${from} 〜 ${to}`
}

// 年でグループ化（降順）
const groupedByYear = computed(() => {
  const groups = new Map<string, TimelineItem[]>()
  for (const item of timelineItems) {
    const year = item.period_from.substring(0, 4)
    if (!groups.has(year)) groups.set(year, [])
    groups.get(year)!.push(item)
  }
  return [...groups.entries()].sort((a, b) => b[0].localeCompare(a[0]))
})

const years = computed(() => groupedByYear.value.map(([year]) => year))

const activeYear = ref<string>(years.value[0] ?? '')
const observers: IntersectionObserver[] = []

function scrollToYear(year: string): void {
  const el = document.getElementById(`timeline-year-${year}`)
  el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

onMounted(() => {
  years.value.forEach((year) => {
    const el = document.getElementById(`timeline-year-${year}`)
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) activeYear.value = year
      },
      { rootMargin: '-10% 0px -60% 0px' },
    )
    obs.observe(el)
    observers.push(obs)
  })
})

onUnmounted(() => {
  observers.forEach((obs) => obs.disconnect())
})

type StackCategory = {
  label: string
  items: string[]
}

function stackCategories(item: TimelineItem): StackCategory[] {
  return [
    { label: '言語', items: item.stacks.languages },
    { label: 'フレームワーク', items: item.stacks.frameworks },
    { label: 'ライブラリ', items: item.stacks.libraries },
    { label: 'DB', items: item.stacks.dbs },
    { label: '環境/ツール/その他', items: item.stacks.infra },
  ].filter((cat) => cat.items.length > 0)
}
</script>

<template>
  <main class="max-w-screen-xl mx-auto px-6 py-8">
    <div
      class="bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm border border-surface-200/60 dark:border-surface-700/60 px-5 py-5"
    >
      <div class="flex items-center gap-2 mb-6">
        <i class="pi pi-history text-surface-400 dark:text-surface-500" />
        <h2 class="text-base font-semibold text-surface-700 dark:text-surface-200">
          キャリアタイムライン
        </h2>
        <span class="text-xs text-surface-400 dark:text-surface-500">{{ timelineItems.length }} 件</span>
      </div>

      <div class="flex gap-6">
        <!-- 年ナビ（左、sticky） -->
        <aside class="hidden md:flex flex-col items-center w-14 shrink-0 sticky top-16 self-start">
          <template v-for="(year, i) in years" :key="year">
            <div v-if="i > 0" class="w-px h-3 bg-surface-300 dark:bg-surface-600" />
            <button
              class="cursor-target text-xs font-mono px-1.5 py-0.5 rounded transition-all duration-200 focus:outline-none"
              :class="
                activeYear === year
                  ? 'text-primary-500 dark:text-primary-400 font-bold bg-primary-50 dark:bg-primary-950/30'
                  : 'text-surface-400 dark:text-surface-500 hover:text-surface-700 dark:hover:text-surface-200'
              "
              @click="scrollToYear(year)"
            >
              {{ year }}
            </button>
          </template>
        </aside>

        <!-- タイムライン本体 -->
        <div class="flex-1 min-w-0 space-y-10">
          <section
            v-for="[year, items] in groupedByYear"
            :key="year"
            :id="`timeline-year-${year}`"
            class="scroll-mt-16"
          >
            <!-- 年見出し -->
            <div class="flex items-center gap-4 mb-5">
              <span class="text-3xl font-bold font-mono text-surface-800 dark:text-surface-100">{{ year }}</span>
              <div class="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
              <span class="text-xs text-surface-400 dark:text-surface-500 shrink-0">{{ items.length }} 件</span>
            </div>

            <!-- エントリーリスト（左ボーダーあり） -->
            <div class="border-l-2 border-surface-200 dark:border-surface-700 ml-2 space-y-5">
              <motion.div
                v-for="(item, i) in items"
                :key="i"
                class="relative pl-8"
                :initial="{ opacity: 0, y: 16 }"
                :while-in-view="{ opacity: 1, y: 0 }"
                :transition="{ duration: 0.4, delay: i * 0.06 }"
                :in-view-options="{ once: true }"
              >
                <!-- マーカードット -->
                <span
                  class="absolute -left-2 top-5 w-3.5 h-3.5 rounded-full border-2 border-primary-400 dark:border-primary-500 bg-white dark:bg-surface-900 block"
                />

                <!-- エントリーカード -->
                <SpotlightCard
                  :spotlight-color="spotlightColor"
                  class="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 hover:border-primary-400 dark:hover:border-primary-500 hover:shadow-sm transition-all p-5"
                >
                  <!-- 期間 -->
                  <p class="text-xs font-mono text-primary-500 dark:text-primary-400 tracking-wide">
                    {{ formatPeriod(item.period_from, item.period_to) }}
                  </p>

                  <!-- 業務内容 -->
                  <p
                    v-if="item.note"
                    class="mt-1.5 text-base font-semibold text-surface-800 dark:text-surface-100 leading-snug"
                  >
                    {{ item.note }}
                  </p>

                  <!-- スタック + 備考（スタックと同じ縦位置から並べる） -->
                  <div
                    v-if="stackCategories(item).length > 0 || item.memo"
                    class="mt-4 flex flex-col lg:flex-row"
                  >
                    <!-- 左: 技術スタック（カテゴリ別） -->
                    <div class="flex-1 min-w-0 space-y-1.5">
                      <div
                        v-for="cat in stackCategories(item)"
                        :key="cat.label"
                        class="flex items-start gap-3"
                      >
                        <span
                          class="text-xs text-surface-400 dark:text-surface-500 shrink-0 whitespace-nowrap w-24 pt-0.5"
                        >{{ cat.label }}</span>
                        <div class="flex flex-wrap gap-1">
                          <Badge
                            v-for="stack in cat.items"
                            :key="stack"
                            :value="stack"
                            severity="secondary"
                            class="text-xs"
                          />
                        </div>
                      </div>

                      <!-- lg未満: 備考をスタック行と同じ書式で表示 -->
                      <div v-if="item.memo" class="lg:hidden flex items-start gap-3">
                        <span
                          class="text-xs text-surface-400 dark:text-surface-500 shrink-0 whitespace-nowrap w-24 pt-0.5"
                        >備考</span>
                        <p class="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">{{ item.memo }}</p>
                      </div>
                    </div>

                    <!-- lg以上: 仕切り線 + 備考 -->
                    <template v-if="item.memo">
                      <div class="hidden lg:block w-px mx-5 self-stretch bg-surface-200 dark:bg-surface-700 shrink-0" />
                      <div class="hidden lg:flex flex-col flex-1 min-w-0">
                        <div class="flex items-start gap-3">
                          <span
                            class="text-xs text-surface-400 dark:text-surface-500 shrink-0 whitespace-nowrap w-24 pt-0.5"
                          >備考</span>
                          <p class="text-sm text-surface-600 dark:text-surface-300 leading-relaxed">{{ item.memo }}</p>
                        </div>
                      </div>
                    </template>
                  </div>
                </SpotlightCard>
              </motion.div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </main>
</template>
