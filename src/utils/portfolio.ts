export function formatPeriod(from: string, to: string | null): string {
  if (!from) return '期間不明'
  return `${from} 〜 ${to ?? '現在'}`
}
