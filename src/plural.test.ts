import { describe, expect, it } from 'vitest'
import { plural } from './plural'

describe('plural', () => {
  const forms: [string, string, string] = ['новость', 'новости', 'новостей']

  it.each([
    [1, 'новость'],
    [2, 'новости'],
    [3, 'новости'],
    [4, 'новости'],
    [5, 'новостей'],
    [11, 'новостей'],
    [21, 'новость'],
    [22, 'новости'],
    [25, 'новостей'],
  ])('для %i возвращает "%s"', (n, expected) => {
    expect(plural(n, forms)).toBe(expected)
  })
})
