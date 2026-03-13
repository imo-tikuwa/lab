<script setup lang="ts">
import { Chart as ChartJS, registerables } from 'chart.js'
import Chart from 'primevue/chart'
import { useColorMode } from '@/composables/color-mode'
import { useThemeStore } from '@/stores/theme'
import { COLOR_THEMES } from '@/theme'

ChartJS.register(...registerables)

const { isDark } = useColorMode()
const themeStore = useThemeStore()

interface LanguageEntry {
  name: string
  color: string
  repoCount: number
}

interface YearStats {
  year: number
  totalCommitContributions: number
  totalIssueContributions: number
  totalPullRequestContributions: number
  totalPullRequestReviewContributions: number
  languages: LanguageEntry[]
  monthlyCommits: number[]
}

interface GitHubStats {
  generatedAt: string
  years: YearStats[]
}

type YearFilter = 'all' | number

const stats = ref<GitHubStats | null>(null)
const loading = ref(true)
const unavailable = ref(false)
const selectedYear = ref<YearFilter>('all')

async function fetchStats(): Promise<void> {
  loading.value = true
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}data/github-stats.json`)
    if (!res.ok) {
      unavailable.value = true
      return
    }
    stats.value = await res.json()
  } catch {
    unavailable.value = true
  } finally {
    loading.value = false
  }
}

onMounted(fetchStats)

// SpotlightCard 用カラー（ProfileSection と同様）
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

const yearOptions = computed<{ label: string; value: YearFilter }[]>(() => {
  if (!stats.value) return []
  return [
    { label: '全期間', value: 'all' },
    ...stats.value.years.map((y) => ({ label: String(y.year), value: y.year as YearFilter })),
  ]
})

const currentYearData = computed<YearStats | null>(() => {
  if (!stats.value || selectedYear.value === 'all') return null
  return stats.value.years.find((y) => y.year === selectedYear.value) ?? null
})

// サマリーカード（レビューは除外）
const summaryItems = computed(() => {
  if (!stats.value) return []

  let contributions: number, issues: number, prs: number, period: string

  if (selectedYear.value === 'all') {
    contributions = stats.value.years.reduce(
      (s, y) => s + y.monthlyCommits.reduce((ms, v) => ms + v, 0),
      0,
    )
    issues = stats.value.years.reduce((s, y) => s + y.totalIssueContributions, 0)
    prs = stats.value.years.reduce((s, y) => s + y.totalPullRequestContributions, 0)
    const first = stats.value.years[0]!.year
    const last = stats.value.years[stats.value.years.length - 1]!.year
    period = `${first} 〜 ${last}`
  } else {
    const y = currentYearData.value
    if (!y) return []
    contributions = y.monthlyCommits.reduce((s, v) => s + v, 0)
    issues = y.totalIssueContributions
    prs = y.totalPullRequestContributions
    period = `${selectedYear.value}年`
  }

  return [
    { label: 'コントリビューション', value: contributions, icon: 'pi pi-calendar', period },
    { label: 'Issue', value: issues, icon: 'pi pi-exclamation-circle', period },
    { label: 'Pull Request', value: prs, icon: 'pi pi-arrow-right-arrow-left', period },
  ]
})

// 年別コミット推移チャート
const yearlyCommitChartData = computed(() => {
  if (!stats.value) return null

  const primaryTheme = COLOR_THEMES.find((t) => t.name === themeStore.primaryColor)
  const primaryColor = primaryTheme?.color ?? COLOR_THEMES[0]!.color
  const mutedColor = isDark.value ? '#475569' : '#cbd5e1'

  const years = stats.value.years
  return {
    labels: years.map((y) => String(y.year)),
    datasets: [
      {
        label: 'コミット数',
        data: years.map((y) => y.monthlyCommits.reduce((s, v) => s + v, 0)),
        backgroundColor: years.map((y) =>
          selectedYear.value === 'all' || y.year === selectedYear.value
            ? primaryColor
            : mutedColor,
        ),
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  }
})

const yearlyCommitChartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: { parsed: { y: number } }) => ` ${ctx.parsed.y} commits`,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: axisColor.value, font: { size: 12 } },
      grid: { color: gridColor.value },
      border: { color: gridColor.value },
    },
    y: {
      beginAtZero: true,
      ticks: { color: axisColor.value, font: { size: 12 } },
      grid: { color: gridColor.value },
      border: { color: gridColor.value },
    },
  },
}))

// 言語プロファイルバー用データ
const languageProfileData = computed(() => {
  if (!stats.value) return []

  let langs: LanguageEntry[]
  if (selectedYear.value === 'all') {
    const langMap = new Map<string, LanguageEntry>()
    for (const y of stats.value.years) {
      for (const l of y.languages) {
        const existing = langMap.get(l.name) ?? { name: l.name, color: l.color, repoCount: 0 }
        existing.repoCount += l.repoCount
        langMap.set(l.name, existing)
      }
    }
    langs = [...langMap.values()].sort((a, b) => b.repoCount - a.repoCount)
  } else {
    langs = currentYearData.value?.languages ?? []
  }

  const total = langs.reduce((s, l) => s + l.repoCount, 0)
  if (total === 0) return []

  const topLangs = langs.slice(0, 8)
  const otherCount = total - topLangs.reduce((s, l) => s + l.repoCount, 0)

  const result = topLangs.map((l) => ({
    name: l.name,
    color: l.color,
    repoCount: l.repoCount,
    percent: Math.round((l.repoCount / total) * 1000) / 10,
  }))

  if (otherCount > 0) {
    result.push({
      name: 'Other',
      color: '#8b949e',
      repoCount: otherCount,
      percent: Math.round((otherCount / total) * 1000) / 10,
    })
  }

  return result
})

// 月別コントリビューションデータ
// contributionCalendar はコミット・Issue・PR・レビューの合計であり「コミット数」とは異なる
const monthlyChartData = computed(() => {
  if (!stats.value || stats.value.years.length === 0) return null

  const monthLabels = [
    '1月', '2月', '3月', '4月', '5月', '6月',
    '7月', '8月', '9月', '10月', '11月', '12月',
  ]
  const primaryTheme = COLOR_THEMES.find((t) => t.name === themeStore.primaryColor)
  const primaryColor = primaryTheme?.color ?? COLOR_THEMES[0]!.color

  if (selectedYear.value !== 'all') {
    const yearData = currentYearData.value
    if (!yearData) return null
    return {
      labels: monthLabels,
      datasets: [
        {
          label: String(selectedYear.value),
          data: yearData.monthlyCommits,
          borderColor: primaryColor,
          backgroundColor: `${primaryColor}18`,
          pointBackgroundColor: primaryColor,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.3,
          fill: true,
          borderWidth: 2,
        },
      ],
    }
  }

  const recentYears = stats.value.years.slice(-2)
  return {
    labels: monthLabels,
    datasets: recentYears.map((y, i) => {
      const isCurrent = i === recentYears.length - 1
      return {
        label: String(y.year),
        data: y.monthlyCommits,
        borderColor: isCurrent ? primaryColor : isDark.value ? '#475569' : '#cbd5e1',
        backgroundColor: isCurrent ? `${primaryColor}18` : 'transparent',
        pointBackgroundColor: isCurrent ? primaryColor : isDark.value ? '#475569' : '#cbd5e1',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
        fill: isCurrent,
        borderWidth: isCurrent ? 2 : 1.5,
      }
    }),
  }
})

const yearlyCommitChartTitle = '年別コントリビューション推移'

const monthlyChartTitle = computed(() =>
  selectedYear.value === 'all'
    ? '月別コントリビューション数（直近2年）'
    : `月別コントリビューション数 (${selectedYear.value}年)`,
)

// チャートオプション（ダークモード対応）
const axisColor = computed(() => (isDark.value ? '#64748b' : '#94a3b8'))
const gridColor = computed(() => (isDark.value ? '#1e293b' : '#f1f5f9'))
const labelColor = computed(() => (isDark.value ? '#cbd5e1' : '#475569'))

// 凡例: 正方形（棒グラフ・折れ線グラフ共通）
const squareLegendLabels = computed(() => ({
  color: labelColor.value,
  padding: 16,
  boxWidth: 12,
  boxHeight: 12,
  font: { size: 12 },
}))

const lineOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'bottom' as const, labels: squareLegendLabels.value },
    tooltip: {
      callbacks: {
        label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) =>
          ` ${ctx.dataset.label ?? ''}: ${ctx.parsed.y}`,
      },
    },
  },
  scales: {
    x: {
      ticks: { color: axisColor.value, font: { size: 12 } },
      grid: { color: gridColor.value },
      border: { color: gridColor.value },
    },
    y: {
      ticks: { color: axisColor.value, font: { size: 12 } },
      grid: { color: gridColor.value },
      border: { color: gridColor.value },
      beginAtZero: true,
    },
  },
}))

</script>

<template>
  <main class="max-w-screen-xl mx-auto px-6 py-8">
    <!-- ローディング -->
    <template v-if="loading">
      <div class="flex flex-wrap gap-1.5 mb-6">
        <Skeleton v-for="n in 9" :key="n" width="68px" height="32px" border-radius="4px" />
      </div>
      <div class="grid grid-cols-3 gap-4 mb-6">
        <Skeleton v-for="n in 3" :key="n" height="80px" border-radius="8px" />
      </div>
      <Skeleton height="80px" border-radius="8px" class="mb-6" />
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton height="384px" border-radius="8px" />
        <Skeleton height="384px" border-radius="8px" />
      </div>
    </template>

    <!-- データなし -->
    <template v-else-if="unavailable || !stats">
      <div class="flex items-center justify-center py-24 text-surface-400 dark:text-surface-500">
        <div class="flex flex-col items-center gap-3">
          <i class="pi pi-github text-4xl" />
          <span class="text-sm">GitHub コントリビューションは準備中です</span>
        </div>
      </div>
    </template>

    <!-- データあり -->
    <template v-else>
      <!-- 年切り替えトグル -->
      <div class="flex flex-wrap gap-1.5 mb-6">
        <button
          v-for="opt in yearOptions"
          :key="String(opt.value)"
          class="cursor-target px-3 py-1.5 rounded text-xs font-medium transition-colors"
          :class="
            selectedYear === opt.value
              ? 'bg-primary-500 text-white'
              : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800'
          "
          @click="selectedYear = opt.value"
        >
          {{ opt.label }}
        </button>
      </div>

      <!-- サマリーカード -->
      <div class="grid grid-cols-3 gap-4 mb-6">
        <SpotlightCard
          v-for="item in summaryItems"
          :key="item.label"
          :spotlight-color="spotlightColor"
          class="cursor-target bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm border border-surface-200/60 dark:border-surface-700/60 rounded-lg hover:border-primary-400/60 dark:hover:border-primary-500/60 transition-colors"
        >
          <div class="p-4 flex flex-col gap-2">
            <div class="flex items-center gap-2 text-surface-400 dark:text-surface-500">
              <i :class="item.icon" style="font-size: 0.85rem" />
              <span class="text-xs">{{ item.label }}</span>
            </div>
            <span class="text-2xl font-bold text-surface-900 dark:text-surface-50 tabular-nums">
              {{ item.value.toLocaleString() }}
            </span>
            <span class="text-xs text-surface-400 dark:text-surface-500">{{ item.period }}</span>
          </div>
        </SpotlightCard>
      </div>

      <!-- 言語プロファイルバー -->
      <SpotlightCard
        v-if="languageProfileData.length > 0"
        :spotlight-color="spotlightColor"
        class="bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm border border-surface-200/60 dark:border-surface-700/60 rounded-lg hover:border-primary-400/60 dark:hover:border-primary-500/60 transition-colors mb-6"
      >
        <div class="p-5">
          <div class="flex items-center gap-2 mb-4">
            <i class="pi pi-code text-surface-400 dark:text-surface-500" />
            <h2 class="text-sm font-semibold text-surface-700 dark:text-surface-200">使用言語</h2>
          </div>
          <!-- 言語バー -->
          <div class="flex rounded-full overflow-hidden h-3 mb-3">
            <div
              v-for="lang in languageProfileData"
              :key="lang.name"
              :title="`${lang.name}: ${lang.percent}%`"
              :style="{ width: `${lang.percent}%`, backgroundColor: lang.color }"
              class="transition-all duration-500 cursor-default"
            />
          </div>
          <!-- 凡例 -->
          <div class="flex flex-wrap gap-x-5 gap-y-1.5">
            <span
              v-for="lang in languageProfileData"
              :key="lang.name"
              class="flex items-center gap-1.5 text-xs text-surface-600 dark:text-surface-400"
            >
              <span
                class="w-2.5 h-2.5 rounded-sm shrink-0"
                :style="{ backgroundColor: lang.color }"
              />
              {{ lang.name }}
              <span class="text-surface-400 dark:text-surface-500">{{ lang.percent }}%</span>
            </span>
          </div>
        </div>
      </SpotlightCard>

      <!-- チャート 2列 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 年別コミット推移チャート -->
        <SpotlightCard
          :spotlight-color="spotlightColor"
          class="bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm border border-surface-200/60 dark:border-surface-700/60 rounded-lg hover:border-primary-400/60 dark:hover:border-primary-500/60 transition-colors"
        >
          <div class="p-5">
            <div class="flex items-center gap-2 mb-4">
              <i class="pi pi-chart-bar text-surface-400 dark:text-surface-500" />
              <h2 class="text-sm font-semibold text-surface-700 dark:text-surface-200">
                {{ yearlyCommitChartTitle }}
              </h2>
            </div>
            <div class="h-96">
              <Chart
                v-if="yearlyCommitChartData"
                type="bar"
                :data="yearlyCommitChartData"
                :options="yearlyCommitChartOptions"
                class="h-full"
              />
            </div>
          </div>
        </SpotlightCard>

        <!-- 月別コントリビューション数 -->
        <SpotlightCard
          :spotlight-color="spotlightColor"
          class="bg-white/80 dark:bg-surface-900/80 backdrop-blur-sm border border-surface-200/60 dark:border-surface-700/60 rounded-lg hover:border-primary-400/60 dark:hover:border-primary-500/60 transition-colors"
        >
          <div class="p-5">
            <div class="flex items-center gap-2 mb-4">
              <i class="pi pi-chart-line text-surface-400 dark:text-surface-500" />
              <h2 class="text-sm font-semibold text-surface-700 dark:text-surface-200">
                {{ monthlyChartTitle }}
              </h2>
            </div>
            <div class="h-96">
              <Chart
                v-if="monthlyChartData"
                type="line"
                :data="monthlyChartData"
                :options="lineOptions"
                class="h-full"
              />
            </div>
          </div>
        </SpotlightCard>
      </div>
    </template>
  </main>
</template>
