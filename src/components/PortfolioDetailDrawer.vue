<script setup lang="ts">
import type { PortfolioItem } from '@/types/portfolio'
import { formatPeriod } from '@/utils/portfolio'

const props = defineProps<{
  visible: boolean
  item: PortfolioItem | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
}>()

const internalVisible = computed({
  get: () => props.visible,
  set: (val: boolean) => {
    emit('update:visible', val)
    if (!val) screenshotDrawerVisible.value = false
  },
})

const screenshotDrawerVisible = ref(false)
const screenshotActiveIndex = ref(0)

function openScreenshotDrawer(index: number): void {
  screenshotActiveIndex.value = index
  screenshotDrawerVisible.value = true
}

const hasStacks = computed(
  () =>
    props.item &&
    (props.item.stacks.languages.length ||
      props.item.stacks.frameworks.length ||
      props.item.stacks.libraries.length ||
      props.item.stacks.tools.length ||
      props.item.stacks.others.length),
)
</script>

<template>
  <Drawer
    v-model:visible="internalVisible"
    position="right"
    style="width: min(95vw, 680px)"
  >
    <template #header>
      <div class="flex flex-col gap-1.5">
        <span class="text-base font-bold text-surface-900 dark:text-surface-50 leading-snug">{{ item?.title }}</span>
        <div class="flex flex-wrap gap-1">
          <Badge
            v-for="cat in item?.category"
            :key="cat"
            :value="cat"
            severity="info"
          />
        </div>
      </div>
    </template>

    <div v-if="item" class="space-y-5">
      <!-- ヘッダー画像（全幅） -->
      <div class="rounded-lg overflow-hidden bg-surface-100 dark:bg-surface-800">
        <img
          :src="item.thumbnail"
          :alt="`${item.title}のサムネイル`"
          class="w-full"
        />
      </div>

      <!-- 2カラムセクション -->
      <div class="flex flex-col sm:flex-row gap-5">
        <!-- 左: プロジェクト概要 -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-3">
            <i class="pi pi-file-text text-primary-500" />
            <h3 class="font-bold text-surface-800 dark:text-surface-100">プロジェクト概要</h3>
          </div>
          <p class="text-sm text-surface-700 dark:text-surface-300 leading-relaxed mb-1">{{ item.summary }}</p>
          <p
            v-for="(desc, i) in item.descriptions"
            :key="i"
            class="text-sm text-surface-700 dark:text-surface-300 leading-relaxed"
          >
            {{ desc }}
          </p>
        </div>

        <!-- 右: 開発期間 + スクリーンショット + 技術スタック + リンク -->
        <div class="sm:w-64 shrink-0 flex flex-col gap-5">
          <!-- 開発期間 -->
          <div>
            <div class="flex items-center gap-2 mb-3">
              <i class="pi pi-calendar text-primary-500" />
              <h3 class="font-bold text-surface-800 dark:text-surface-100">開発期間</h3>
            </div>
            <p class="text-sm text-surface-600 dark:text-surface-400 whitespace-nowrap">
              {{ formatPeriod(item.period_from, item.period_to) }}
            </p>
          </div>

          <!-- スクリーンショット（1枚） -->
          <div v-if="item.screenshots.length">
            <div class="flex items-center gap-2 mb-3">
              <i class="pi pi-images text-primary-500" />
              <h3 class="font-bold text-surface-800 dark:text-surface-100">スクリーンショット</h3>
            </div>
            <div
              class="relative overflow-hidden rounded cursor-pointer group aspect-video"
              @click="openScreenshotDrawer(0)"
            >
              <img
                :src="item.screenshots[0]!.thumbnailImageSrc"
                :alt="item.screenshots[0]!.alt"
                class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <i class="pi pi-search text-white text-xl drop-shadow" />
              </div>
            </div>
          </div>

          <!-- 技術スタック -->
          <div v-if="hasStacks">
            <div class="flex items-center gap-2 mb-3">
              <i class="pi pi-cog text-primary-500" />
              <h3 class="font-bold text-surface-800 dark:text-surface-100">技術スタック</h3>
            </div>
            <div class="space-y-3">
              <div v-if="item.stacks.languages.length">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <i class="pi pi-code text-primary-500 text-xs" />
                  <span class="text-xs font-semibold text-surface-500 dark:text-surface-400">言語</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <Badge v-for="lang in item.stacks.languages" :key="lang" :value="lang" severity="success" />
                </div>
              </div>
              <div v-if="item.stacks.frameworks.length">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <i class="pi pi-box text-primary-500 text-xs" />
                  <span class="text-xs font-semibold text-surface-500 dark:text-surface-400">フレームワーク</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <Badge v-for="fw in item.stacks.frameworks" :key="fw" :value="fw" severity="success" />
                </div>
              </div>
              <div v-if="item.stacks.libraries.length">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <i class="pi pi-link text-primary-500 text-xs" />
                  <span class="text-xs font-semibold text-surface-500 dark:text-surface-400">ライブラリ</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <Badge v-for="lib in item.stacks.libraries" :key="lib" :value="lib" severity="success" />
                </div>
              </div>
              <div v-if="item.stacks.tools.length">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <i class="pi pi-wrench text-primary-500 text-xs" />
                  <span class="text-xs font-semibold text-surface-500 dark:text-surface-400">ツール</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <Badge v-for="tool in item.stacks.tools" :key="tool" :value="tool" severity="success" />
                </div>
              </div>
              <div v-if="item.stacks.others.length">
                <div class="flex items-center gap-1.5 mb-1.5">
                  <i class="pi pi-ellipsis-h text-primary-500 text-xs" />
                  <span class="text-xs font-semibold text-surface-500 dark:text-surface-400">その他</span>
                </div>
                <div class="flex flex-wrap gap-1.5">
                  <Badge v-for="other in item.stacks.others" :key="other" :value="other" severity="success" />
                </div>
              </div>
            </div>
          </div>

          <!-- リンク -->
          <div v-if="item.links?.length">
            <div class="flex items-center gap-2 mb-3">
              <i class="pi pi-external-link text-primary-500" />
              <h3 class="font-bold text-surface-800 dark:text-surface-100">リンク</h3>
            </div>
            <div class="flex flex-col gap-2">
              <a
                v-for="link in item.links"
                :key="link.url"
                :href="link.url"
                target="_blank"
                rel="noopener noreferrer"
                class="no-underline"
              >
                <Button :label="link.label" icon="pi pi-external-link" icon-pos="right" class="w-full" size="small" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Drawer>

  <ScreenshotDrawer
    v-model:visible="screenshotDrawerVisible"
    v-model:active-index="screenshotActiveIndex"
    :screenshots="item?.screenshots ?? []"
  />
</template>
