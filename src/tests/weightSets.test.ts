import { describe, expect, it } from 'vitest'
import { parseItalianDecimal } from '@/utils/number'
import { duplicateLastSet, validateWeightSets } from '@/utils/weightSets'
import type { WeightSetDraft } from '@/models'

const empty: WeightSetDraft = { weight: 0, weightMode: 'total', repetitions: 10 }

describe('serie pesi', () => {
  it('duplica tutti i valori dell’ultima serie senza condividere lo stesso oggetto', () => {
    const first: WeightSetDraft = { weight: 62.5, weightMode: 'per_side', repetitions: 8 }
    const result = duplicateLastSet([first], empty)
    expect(result).toEqual([first, first])
    expect(result[1]).not.toBe(first)
  })

  it('crea la prima serie dal valore predefinito', () => {
    expect(duplicateLastSet([], empty)).toEqual([empty])
  })

  it('accetta virgola e punto nei decimali', () => {
    expect(parseItalianDecimal('12,5')).toBe(12.5)
    expect(parseItalianDecimal('12.5')).toBe(12.5)
  })

  it('valida peso e ripetizioni', () => {
    expect(validateWeightSets([{ weight: -1, weightMode: 'total', repetitions: 2.5 }])).toEqual({ 0: { weight: expect.any(String), repetitions: expect.any(String) } })
    expect(validateWeightSets([{ weight: 0, weightMode: 'total', repetitions: 1 }])).toEqual({})
  })
})
