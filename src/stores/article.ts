import { defineStore } from 'pinia'

export interface ArticleItem {
  id: string
  title: string
  url: string
  created_at: string
  tags: string[]
  source: 'qiita' | 'zenn'
  likes_count: number
}

export const useArticleStore = defineStore('article', () => {
  const items = ref<ArticleItem[]>([])
  const loading = ref(false)
  const fetched = ref(false)

  async function load(): Promise<void> {
    if (fetched.value) return
    loading.value = true
    try {
      const res = await fetch(`${import.meta.env.BASE_URL}data/articles.json`)
      if (!res.ok) return
      const data: ArticleItem[] = await res.json()
      items.value = data
      fetched.value = true
    } finally {
      loading.value = false
    }
  }

  return { items, loading, fetched, load }
})
