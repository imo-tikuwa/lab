/**
 * Qiita / Zenn の記事・スクラップを取得して public/data/articles.json に出力するスクリプト。
 * ビルド前に実行することを想定。
 *
 * 使用方法:
 *   node scripts/fetch-articles.js
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const QIITA_USER = 'imo_tikuwa'
const ZENN_USER = 'imo_tikuwa'

/**
 * @typedef {{ id: string; title: string; url: string; created_at: string; tags: string[]; source: 'qiita' | 'zenn'; likes_count: number }} ArticleItem
 */

/**
 * Qiita の公開記事を全件取得する（ページネーション対応）。
 * @returns {Promise<ArticleItem[]>}
 */
async function fetchQiita() {
  /** @type {ArticleItem[]} */
  const items = []
  let page = 1

  while (true) {
    const res = await fetch(
      `https://qiita.com/api/v2/users/${QIITA_USER}/items?per_page=100&page=${page}`,
    )
    if (!res.ok) {
      console.error(`[Qiita] API error: ${res.status} ${res.statusText}`)
      break
    }

    /** @type {{ id: string; title: string; url: string; created_at: string; tags: { name: string }[]; likes_count: number }[]} */
    const data = await res.json()
    if (data.length === 0) break

    data.forEach((a) => {
      items.push({
        id: `qiita-${a.id}`,
        title: a.title,
        url: a.url,
        created_at: a.created_at,
        tags: a.tags.map((t) => t.name),
        source: 'qiita',
        likes_count: a.likes_count,
      })
    })

    if (data.length < 100) break
    page++
  }

  return items
}

/**
 * Zenn のスクラップを全件取得する。
 * @returns {Promise<ArticleItem[]>}
 */
async function fetchZenn() {
  const res = await fetch(`https://zenn.dev/api/scraps?username=${ZENN_USER}`)
  if (!res.ok) {
    console.error(`[Zenn] API error: ${res.status} ${res.statusText}`)
    return []
  }

  /** @type {{ scraps: { slug: string; title: string; created_at: string; liked_count: number; topics: { name: string; display_name?: string }[] }[] }} */
  const data = await res.json()

  return data.scraps.map((s) => ({
    id: `zenn-${s.slug}`,
    title: s.title,
    url: `https://zenn.dev/${ZENN_USER}/scraps/${s.slug}`,
    created_at: s.created_at,
    tags: s.topics.map((t) => t.display_name ?? t.name),
    source: /** @type {'zenn'} */ ('zenn'),
    likes_count: s.liked_count,
  }))
}

const [qiita, zenn] = await Promise.all([fetchQiita(), fetchZenn()])

const articles = [...qiita, ...zenn].sort(
  (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
)

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../public/data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'articles.json'), JSON.stringify(articles))

console.log(`[fetch-articles] Qiita: ${qiita.length} 件, Zenn: ${zenn.length} 件`)
console.log(`[fetch-articles] 合計 ${articles.length} 件 → public/data/articles.json`)
