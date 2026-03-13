/**
 * GitHub GraphQL API からコントリビューションデータを取得して
 * public/data/github-stats.json に出力するスクリプト。
 * ビルド前に実行することを想定。
 *
 * 使用方法:
 *   GH_STATS_TOKEN=<PAT> node scripts/fetch-github-stats.js
 */

import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const GITHUB_LOGIN = 'imo-tikuwa'
const START_YEAR = 2019

// GH_STATS_TOKEN（PAT）優先。未設定時は GITHUB_TOKEN（GitHub Actions 自動提供）にフォールバック。
// どちらもない場合はスキップ。
// GH_STATS_TOKEN に repo スコープがあるとプライベートリポジトリのコントリビューションも取得できる。
const GH_STATS_TOKEN = process.env.GH_STATS_TOKEN ?? process.env.GITHUB_TOKEN

if (!GH_STATS_TOKEN) {
  console.warn(
    '[fetch-github-stats] GH_STATS_TOKEN / GITHUB_TOKEN が設定されていません。スキップします。',
  )
  process.exit(0)
}

/** @param {object} variables */
async function graphql(query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `bearer ${GH_STATS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`)
  const json = await res.json()
  if (json.errors) throw new Error(`GraphQL error: ${JSON.stringify(json.errors)}`)
  return json.data
}

// ── 1. 年別コントリビューション（commitContributionsByRepository は使用しない）──────────────

const CONTRIBUTIONS_QUERY = `
query ContributionsQuery($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      totalCommitContributions
      totalIssueContributions
      totalPullRequestContributions
      totalPullRequestReviewContributions
      contributionCalendar {
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
`

/**
 * @param {number} year
 */
async function fetchYear(year) {
  const from = `${year}-01-01T00:00:00Z`
  const to = `${year}-12-31T23:59:59Z`
  const data = await graphql(CONTRIBUTIONS_QUERY, { login: GITHUB_LOGIN, from, to })
  const coll = data.user.contributionsCollection

  const monthlyCommits = Array.from({ length: 12 }, () => 0)
  for (const week of coll.contributionCalendar.weeks) {
    for (const day of week.contributionDays) {
      const month = new Date(day.date).getUTCMonth()
      monthlyCommits[month] += day.contributionCount
    }
  }

  return {
    year,
    totalCommitContributions: coll.totalCommitContributions,
    totalIssueContributions: coll.totalIssueContributions,
    totalPullRequestContributions: coll.totalPullRequestContributions,
    totalPullRequestReviewContributions: coll.totalPullRequestReviewContributions,
    monthlyCommits,
  }
}

// ── 2. リポジトリ一覧取得（言語データのソース）────────────────────────────────────────────

const REPO_QUERY = `
query RepoQuery($login: String!, $after: String) {
  user(login: $login) {
    repositories(
      first: 100
      after: $after
      affiliations: [OWNER, COLLABORATOR]
      orderBy: { field: UPDATED_AT, direction: DESC }
    ) {
      pageInfo { hasNextPage endCursor }
      nodes {
        primaryLanguage { name color }
        createdAt
        pushedAt
      }
    }
  }
}
`

async function fetchRepoLanguages() {
  /** @type {{ language: { name: string; color: string }; createdAt: string; pushedAt: string }[]} */
  const repos = []
  let after = null
  let pageCount = 0

  while (true) {
    const data = await graphql(REPO_QUERY, { login: GITHUB_LOGIN, after })
    const repoData = data.user.repositories

    for (const node of repoData.nodes) {
      if (!node.primaryLanguage) continue
      repos.push({
        language: node.primaryLanguage,
        createdAt: node.createdAt,
        pushedAt: node.pushedAt,
      })
    }

    pageCount++
    if (!repoData.pageInfo.hasNextPage || pageCount >= 5) break
    after = repoData.pageInfo.endCursor
  }

  console.log(`[fetch-github-stats] リポジトリ取得: ${repos.length} 件 (${pageCount} ページ)`)
  return repos
}

/**
 * 指定年に活動していたリポジトリをもとに言語分布を集計。
 * 「作成日 <= 年末」かつ「最終プッシュ日 >= 年始」のリポジトリを対象にする。
 *
 * @param {{ language: { name: string; color: string }; createdAt: string; pushedAt: string }[]} repos
 * @param {number} year
 */
function getLanguagesForYear(repos, year) {
  const yearStart = new Date(`${year}-01-01T00:00:00Z`)
  const yearEnd = new Date(`${year}-12-31T23:59:59Z`)

  /** @type {Map<string, { name: string; color: string; repoCount: number }>} */
  const langMap = new Map()
  for (const repo of repos) {
    const created = new Date(repo.createdAt)
    const pushed = new Date(repo.pushedAt)
    if (created > yearEnd || pushed < yearStart) continue
    const lang = repo.language
    const existing = langMap.get(lang.name) ?? {
      name: lang.name,
      color: lang.color,
      repoCount: 0,
    }
    existing.repoCount++
    langMap.set(lang.name, existing)
  }

  return [...langMap.values()].sort((a, b) => b.repoCount - a.repoCount)
}

// ── メイン ────────────────────────────────────────────────────────────────────────────────

const currentYear = new Date().getFullYear()

// リポジトリ一覧を先に取得（1回だけ）
console.log('[fetch-github-stats] リポジトリ一覧を取得中...')
const allRepos = await fetchRepoLanguages()

// 年別コントリビューション取得
const years = []
for (let year = START_YEAR; year <= currentYear; year++) {
  console.log(`[fetch-github-stats] Fetching ${year}...`)
  try {
    const yearData = await fetchYear(year)
    const languages = getLanguagesForYear(allRepos, year)
    years.push({ ...yearData, languages })
    console.log(
      `[fetch-github-stats] ${year}: ${yearData.totalCommitContributions} commits, ${languages.length} languages`,
    )
  } catch (err) {
    console.error(`[fetch-github-stats] ${year} 取得失敗:`, err.message)
  }
}

const output = {
  generatedAt: new Date().toISOString(),
  years,
}

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '../public/data')
mkdirSync(outDir, { recursive: true })
writeFileSync(join(outDir, 'github-stats.json'), JSON.stringify(output))

const totalCommits = years.reduce((sum, y) => sum + y.totalCommitContributions, 0)
console.log(
  `[fetch-github-stats] ${years.length} 年分, 合計 ${totalCommits} コミット → public/data/github-stats.json`,
)
