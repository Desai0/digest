export interface RawNewsItem {
  id: string
  date: string
  source: string
  title: string
  summary: string
  tags: string | string[]
  link: string
}

export interface NewsItem {
  id: string
  date: string
  source: string
  title: string
  summary: string
  tags: string[]
  link: string
}

export interface DigestResponse {
  news: RawNewsItem[]
}
