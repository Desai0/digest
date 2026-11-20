import type { DigestResponse, NewsItem } from './types'

export function parseTags(tags: string | string[]): string[] {
  if (Array.isArray(tags)) {
    return tags.map((t) => t.trim()).filter(Boolean)
  }
  if (typeof tags === 'string') {
    return tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
  }
  return []
}

export async function loadDigest(url = import.meta.env.VITE_DIGEST_URL as string): Promise<NewsItem[]> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Дайджест не загрузился: код ${response.status}.`)
  }
  const data: DigestResponse = await response.json()
  const rawNews = Array.isArray(data?.news) ? data.news : []

  return rawNews
    .map((item) => ({
      id: item.id,
      date: item.date,
      source: item.source,
      title: item.title,
      summary: item.summary,
      tags: parseTags(item.tags),
      link: item.link,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}
