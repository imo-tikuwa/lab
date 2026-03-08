<script setup lang="ts">
interface Tool {
  name: string
  description: string
  features: string[]
  techStack: string[]
  path: string
  publishedAt: string
}

const tools: Tool[] = [
  {
    name: 'RPGツクール MV/MZ セーブエディター',
    description: 'RPGツクール MV / MZ のセーブデータ（.rpgsave / .rmmzsave）をブラウザ上で閲覧・編集するツール',
    features: [
      'RPGツクール MV / MZ のセーブデータ（.rpgsave / .rmmzsave）をブラウザ上で閲覧・編集',
      'JSON ツリー形式で値をインライン編集（数値・文字列・真偽値に対応）',
      'リビジョン管理：編集履歴をリビジョンとして保存・比較・ロールバック',
      '異なるセーブデータ同士の差分比較',
      'キー名・値の一括検索・置換',
      'Undo / Redo・変更履歴の確認',
      '編集済みデータの .rpgsave 形式でのダウンロード',
      '自動保存・ZIP インポート / エクスポート',
    ],
    techStack: ['Vue 3 / TypeScript', 'PrimeVue / Tailwind CSS', 'Pinia', 'IndexedDB', 'Vite'],
    path: '/lab/rpgsave-editor/',
    publishedAt: '2026/03/08',
  },
  {
    name: '風来のシレン6 値段識別ツール',
    description: '風来のシレン6 とぐろ島探検録に出てくるアイテムの買値・売値からアイテムを絞り込む識別ツール',
    features: [
      '買値・売値を入力してアイテムを絞り込む（シンプルモード）',
      'データテーブルを使った複合条件でのフィルタリング（詳細モード）',
      '祝福・呪い状態の価格を考慮した表示',
      '識別済みアイテムの除外設定（命名済み・識別済みアイテムを手動で管理）',
      '杖・お香・壺の使用回数ごとの価格表示',
    ],
    techStack: ['Vue 3 / TypeScript', 'PrimeVue / Tailwind CSS', 'Pinia', 'Vite'],
    path: '/lab/shiren6-price-helper/',
    publishedAt: '2024/02/19',
  },
]

type LayoutType = 'list' | 'grid'

const layout = ref<LayoutType>('list')
const sortOrder = ref<1 | -1>(1)

const layoutOptions: { value: LayoutType; icon: string }[] = [
  { value: 'list', icon: 'pi pi-list' },
  { value: 'grid', icon: 'pi pi-th-large' },
]

const sortedTools = computed(() =>
  [...tools].sort((a, b) => a.publishedAt.localeCompare(b.publishedAt) * sortOrder.value),
)

function toggleSort(): void {
  sortOrder.value = sortOrder.value === 1 ? -1 : 1
}
</script>

<template>
  <div class="min-h-screen bg-surface-50">
    <header class="px-6 py-5 border-b border-surface-200 bg-white">
      <h1 class="text-2xl font-bold text-surface-900">lab</h1>
      <p class="mt-1 text-sm text-surface-500">公開ツール一覧</p>
    </header>

    <main class="max-w-4xl mx-auto px-6 py-10">
      <div class="flex items-center justify-between mb-4">
        <Button
          :icon="sortOrder === 1 ? 'pi pi-sort-amount-up-alt' : 'pi pi-sort-amount-down-alt'"
          :label="sortOrder === 1 ? '公開日: 古い順' : '公開日: 新しい順'"
          variant="outlined"
          size="small"
          @click="toggleSort"
        />
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

      <DataView :value="sortedTools" :layout="layout" data-key="path">
        <template #list="{ items }">
          <div class="flex flex-col divide-y divide-surface-200 border border-surface-200 bg-white">
            <a
              v-for="tool in items"
              :key="tool.path"
              :href="tool.path"
              class="group flex flex-col gap-4 p-6 hover:bg-surface-100 transition-colors no-underline"
            >
              <div class="flex items-start justify-between gap-4">
                <div class="flex flex-col gap-1">
                  <span class="text-base font-semibold text-surface-900 group-hover:text-primary-600 transition-colors">
                    {{ tool.name }}
                  </span>
                  <span class="text-sm text-surface-500">
                    {{ tool.description }}
                  </span>
                </div>
                <span class="shrink-0 text-xs text-surface-400 whitespace-nowrap pt-0.5">
                  公開日: {{ tool.publishedAt }}
                </span>
              </div>

              <div class="grid sm:grid-cols-2 gap-4">
                <div>
                  <p class="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-2">できること</p>
                  <ul class="flex flex-col gap-1">
                    <li
                      v-for="feature in tool.features"
                      :key="feature"
                      class="flex items-start gap-1.5 text-sm text-surface-600"
                    >
                      <i class="pi pi-check text-primary-500 mt-0.5 shrink-0" style="font-size: 0.7rem" />
                      <span>{{ feature }}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <p class="text-xs font-semibold text-surface-400 uppercase tracking-wide mb-2">技術スタック</p>
                  <div class="flex flex-wrap gap-1.5">
                    <span
                      v-for="tech in tool.techStack"
                      :key="tech"
                      class="px-2 py-0.5 rounded text-xs bg-surface-100 text-surface-600"
                    >
                      {{ tech }}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          </div>
        </template>

        <template #grid="{ items }">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <a
              v-for="tool in items"
              :key="tool.path"
              :href="tool.path"
              class="group flex flex-col gap-3 p-5 bg-white border border-surface-200 hover:border-primary-400 hover:shadow-md transition-all no-underline"
            >
              <div class="flex flex-col gap-1">
                <span class="text-base font-semibold text-surface-900 group-hover:text-primary-600 transition-colors">
                  {{ tool.name }}
                </span>
                <span class="text-sm text-surface-500 leading-relaxed">
                  {{ tool.description }}
                </span>
              </div>
              <div class="flex flex-wrap gap-1.5 mt-auto pt-1">
                <span
                  v-for="tech in tool.techStack"
                  :key="tech"
                  class="px-2 py-0.5 rounded text-xs bg-surface-100 text-surface-600"
                >
                  {{ tech }}
                </span>
              </div>
              <span class="text-xs text-surface-400">公開日: {{ tool.publishedAt }}</span>
            </a>
          </div>
        </template>

        <template #empty>
          <div class="flex items-center justify-center py-12 text-surface-400 bg-white border border-surface-200">
            <span>ツールが見つかりません</span>
          </div>
        </template>
      </DataView>
    </main>
  </div>
</template>
