import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const mockData = {
  news: [
    {
      id: 'old-1',
      date: '2026-11-17T10:00:00.000Z',
      source: 'Хабр',
      title: 'Старая новость',
      summary: 'Пересказ старой новости ровно в двух предложениях. Второе предложение пересказа.',
      tags: 'программирование',
      link: 'https://example.com/old',
    },
    {
      id: 'fresh-1',
      date: '2026-11-19T10:00:00.000Z',
      source: '3DNews',
      title: 'Свежая новость',
      summary: 'Пересказ свежей новости ровно в двух предложениях. Второе предложение пересказа.',
      tags: 'ИИ, наука',
      link: 'https://example.com/fresh',
    },
  ],
}

describe('App - Задание 1', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('отображает карточки новостей в порядке от свежих к старым', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })
    )

    render(<App />)

    expect(screen.getByRole('status')).toHaveTextContent('Загрузка дайджеста…')

    const titles = await screen.findAllByRole('heading', { level: 2 })
    expect(titles).toHaveLength(2)
    expect(titles[0]).toHaveTextContent('Свежая новость')
    expect(titles[1]).toHaveTextContent('Старая новость')

    expect(screen.getByText('3DNews')).toBeInTheDocument()
    expect(screen.getByText('Хабр')).toBeInTheDocument()
    expect(screen.getByText('ИИ')).toBeInTheDocument()
    expect(screen.getByText('наука')).toBeInTheDocument()
  })

  it('показывает сообщение об ошибке с ролью alert при статусе 500', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      })
    )

    render(<App />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Дайджест не загрузился: код 500.')
  })
})
