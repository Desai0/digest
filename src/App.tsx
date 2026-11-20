import { useEffect, useState } from 'react'
import { loadDigest } from './digest'
import type { NewsItem } from './types'

export default function App() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    async function fetchNews() {
      try {
        const items = await loadDigest()
        if (!ignore) {
          setNews(items)
        }
      } catch (e) {
        if (!ignore) {
          setError((e as Error).message)
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    fetchNews()
    return () => {
      ignore = true
    }
  }, [])

  return (
    <div className="container">
      <header className="header">
        <h1>Дайджест новостей</h1>
      </header>

      <main className="main">
        {loading && <p role="status">Загрузка дайджеста…</p>}
        {error && <p role="alert" className="error-message">{error}</p>}

        {!loading && !error && (
          <div className="news-list" aria-label="Список новостей">
            {news.map((item) => (
              <article key={item.id} className="news-card">
                <h2>
                  <a href={item.link} target="_blank" rel="noreferrer">
                    {item.title}
                  </a>
                </h2>
                <div className="news-meta">
                  <span className="source">{item.source}</span>
                  <span className="meta-separator">·</span>
                  <time dateTime={item.date}>
                    {new Date(item.date).toLocaleString('ru')}
                  </time>
                </div>
                <p className="summary">{item.summary}</p>
                <ul className="tags" aria-label="Теги">
                  {item.tags.map((tag) => (
                    <li key={tag} className="tag">
                      {tag}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
