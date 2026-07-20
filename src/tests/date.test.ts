import { describe, expect, it } from 'vitest'
import { formatItalianDate, toDateKey } from '@/utils/date'

describe('date italiane', () => {
  it('crea una chiave locale senza conversione UTC', () => {
    expect(toDateKey(new Date(2026, 6, 20, 23, 30))).toBe('2026-07-20')
  })

  it('formatta secondo la localizzazione italiana', () => {
    expect(formatItalianDate('2026-07-20', { day: '2-digit', month: '2-digit', year: 'numeric' })).toBe('20/07/2026')
  })
})
