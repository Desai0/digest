import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

const mockData = {
  news: [
    {
      id: 'item-1',
      date: '2026-11-19T10:00:00.000Z',
      source: 'Хабр',
      title: 'Релиз React 19',
      summary: 'Новая версия популярной библиотеки с серверными компонентами.',
      tags: 'программирование, интернет',
      link: 'https://habr.com/1',
    },
    {
      id: 'item-2',
      date: '2026-11-18T10:00:00.000Z',
      source: '3DNews',
      title: 'Телескоп Джеймс Уэбб',
      summary: 'Обнаружена планета с океанами магмы и признаками атмосферы.',
      tags: 'наука',
      link: 'https://3dnews.ru/2',
    },
    {
      id: 'item-3',
      date: '2026-11-17T10:00:00.000Z',
      source: 'iXBT',
      title: 'Новый ускоритель для ИИ',
      summary: 'Компания представила чипы для обучения нейросетей.',
      tags: 'ИИ, железо',
      link: 'https://ixbt.com/3',
    },
  ],
}

describe('App', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    localStorage.clear()
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockData,
      })
    )
  })

  describe('Задание 1: Загрузка и карточки', () => {
    it('отображает карточки новостей в порядке от свежих к старым', async () => {
      render(<App />)

      expect(screen.getByRole('status')).toHaveTextContent('Загрузка дайджеста…')

      const titles = await screen.findAllByRole('heading', { level: 2 })
      expect(titles).toHaveLength(3)
      expect(titles[0]).toHaveTextContent('Релиз React 19')
      expect(titles[1]).toHaveTextContent('Телескоп Джеймс Уэбб')
      expect(titles[2]).toHaveTextContent('Новый ускоритель для ИИ')

      expect(screen.getByText('Хабр')).toBeInTheDocument()
      expect(screen.getByText('3DNews')).toBeInTheDocument()
      expect(screen.getByText('iXBT')).toBeInTheDocument()
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

  describe('Задание 2: Поиск и фильтры', () => {
    it('фильтрует карточки по тексту в поиске (по заголовку и пересказу)', async () => {
      const user = userEvent.setup()
      render(<App />)

      await screen.findByText('Релиз React 19')
      const searchInput = screen.getByLabelText('Поиск')

      await user.type(searchInput, 'магмы')
      expect(screen.getByText('Телескоп Джеймс Уэбб')).toBeInTheDocument()
      expect(screen.queryByText('Релиз React 19')).not.toBeInTheDocument()
      expect(screen.queryByText('Новый ускоритель для ИИ')).not.toBeInTheDocument()

      await user.clear(searchInput)
      expect(screen.getByText('Релиз React 19')).toBeInTheDocument()
      expect(screen.getByText('Новый ускоритель для ИИ')).toBeInTheDocument()
    })

    it('фильтрует карточки по выбранному тегу', async () => {
      const user = userEvent.setup()
      render(<App />)

      await screen.findByText('Релиз React 19')
      const tagChip = screen.getByRole('button', { name: 'наука' })

      await user.click(tagChip)
      expect(screen.getByText('Телескоп Джеймс Уэбб')).toBeInTheDocument()
      expect(screen.queryByText('Релиз React 19')).not.toBeInTheDocument()
      expect(screen.queryByText('Новый ускоритель для ИИ')).not.toBeInTheDocument()

      const allChip = screen.getByRole('button', { name: 'Все' })
      await user.click(allChip)
      expect(screen.getByText('Релиз React 19')).toBeInTheDocument()
    })

    it('показывает сообщение «Новостей не найдено», когда фильтр отсекает всё', async () => {
      const user = userEvent.setup()
      render(<App />)

      await screen.findByText('Релиз React 19')
      const searchInput = screen.getByLabelText('Поиск')

      await user.type(searchInput, 'несуществующий_запрос_12345')
      expect(screen.getByText('Новостей не найдено')).toBeInTheDocument()
      expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument()
      expect(screen.getByText('Показано 0 из 3 новостей')).toBeInTheDocument()
    })
  })

  describe('Задание 3: Отметка «прочитано» и сохранение в localStorage', () => {
    it('отмечает новость прочитанной при клике и снимает отметку повторным кликом', async () => {
      const user = userEvent.setup()
      render(<App />)

      await screen.findByText('Релиз React 19')
      const buttons = screen.getAllByRole('button', { name: 'Отметить прочитанным' })
      const firstButton = buttons[0]

      await user.click(firstButton)
      expect(firstButton).toHaveTextContent('Прочитано ✓')
      expect(firstButton).toHaveAttribute('aria-pressed', 'true')
      expect(firstButton.closest('article')).toHaveClass('news-card--read')
      expect(localStorage.getItem('digest_read_ids')).toContain('item-1')

      await user.click(firstButton)
      expect(firstButton).toHaveTextContent('Отметить прочитанным')
      expect(firstButton).toHaveAttribute('aria-pressed', 'false')
      expect(firstButton.closest('article')).not.toHaveClass('news-card--read')
    })

    it('восстанавливает отметки о прочитанном из localStorage при перезагрузке', async () => {
      localStorage.setItem('digest_read_ids', JSON.stringify(['item-2']))

      render(<App />)

      await screen.findByText('Релиз React 19')

      const telescopeCard = screen.getByText('Телескоп Джеймс Уэбб').closest('article')
      expect(telescopeCard).toHaveClass('news-card--read')
      expect(telescopeCard).toHaveTextContent('Прочитано ✓')

      const reactCard = screen.getByText('Релиз React 19').closest('article')
      expect(reactCard).not.toHaveClass('news-card--read')
      expect(reactCard).toHaveTextContent('Отметить прочитанным')
    })

    it('флажок «Только непрочитанные» скрывает прочитанные новости', async () => {
      const user = userEvent.setup()
      localStorage.setItem('digest_read_ids', JSON.stringify(['item-1']))

      render(<App />)

      await screen.findByText('Релиз React 19')
      const unreadCheckbox = screen.getByLabelText('Только непрочитанные')

      await user.click(unreadCheckbox)
      expect(screen.queryByText('Релиз React 19')).not.toBeInTheDocument()
      expect(screen.getByText('Телескоп Джеймс Уэбб')).toBeInTheDocument()
      expect(screen.getByText('Новый ускоритель для ИИ')).toBeInTheDocument()
      expect(screen.getByText('Показано 2 из 3 новостей')).toBeInTheDocument()
    })
  })
})
