import { useEffect, useState } from 'react'
import { loadDigest } from './digest'
import { plural } from './plural'
import type { NewsItem } from './types'

export default function App() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [query, setQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState('')
  const [onlyUnread, setOnlyUnread] = useState(false)
  const [readIds, setReadIds] = useState<string[]>([])

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

  const allTags = Array.from(new Set(news.flatMap((item) => item.tags))).sort()

  const filteredNews = news.filter((item) => {
    const q = query.trim().toLowerCase()
    const matchesQuery =
      !q ||
      item.title.toLowerCase().includes(q) ||
      item.summary.toLowerCase().includes(q)

    const matchesTag = !selectedTag || item.tags.includes(selectedTag)
    const matchesUnread = !onlyUnread || !readIds.includes(item.id)

    return matchesQuery && matchesTag && matchesUnread
  })

  function handleTagClick(tag: string) {
    setSelectedTag((prev) => (prev === tag ? '' : tag))
  }

  function handleToggleRead(id: string) {
    setReadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const newsWord = plural(news.length, ['новости', 'новостей', 'новостей'])
  const counterText = `Показано ${filteredNews.length} из ${news.length} ${newsWord}`

  return (
    <div className="container">
      <header className="header">
        <h1>Дайджест новостей</h1>
      </header>

      <main className="main">
        {loading && <p role="status">Загрузка дайджеста…</p>}
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}

        {!loading && !error && (
          <>
            <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
              <div className="filter-group">
                <label htmlFor="search-input">Поиск</label>
                <input
                  id="search-input"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск по заголовку и пересказу"
                />
              </div>

              <div className="filter-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={onlyUnread}
                    onChange={(e) => setOnlyUnread(e.target.checked)}
                  />
                  <span>Только непрочитанные</span>
                </label>
              </div>

              {allTags.length > 0 && (
                <div className="tag-filters" aria-label="Фильтр по тегам">
                  <span className="tag-filters-label">Теги:</span>
                  <button
                    type="button"
                    className={`tag-chip ${selectedTag === '' ? 'tag-chip--active' : ''}`}
                    onClick={() => setSelectedTag('')}
                    aria-pressed={selectedTag === ''}
                  >
                    Все
                  </button>
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      className={`tag-chip ${selectedTag === tag ? 'tag-chip--active' : ''}`}
                      onClick={() => handleTagClick(tag)}
                      aria-pressed={selectedTag === tag}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              )}
            </form>

            <p className="counter" aria-live="polite">
              {counterText}
            </p>

            {filteredNews.length === 0 ? (
              <p className="empty">Новостей не найдено</p>
            ) : (
              <div className="news-list" aria-label="Список новостей">
                {filteredNews.map((item) => {
                  const isRead = readIds.includes(item.id)
                  return (
                    <article
                      key={item.id}
                      className={`news-card ${isRead ? 'news-card--read' : ''}`}
                    >
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
                      <button
                        type="button"
                        className={`read-button ${isRead ? 'read-button--read' : ''}`}
                        onClick={() => handleToggleRead(item.id)}
                        aria-pressed={isRead}
                      >
                        {isRead ? 'Прочитано ✓' : 'Отметить прочитанным'}
                      </button>
                    </article>
                  )
                })}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
