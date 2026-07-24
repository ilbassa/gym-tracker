import { describe, expect, it } from 'vitest'
import { formatWeightSet } from '@/utils/weightDisplay'

describe('visualizzazione serie pesi', () => {
  it('mostra peso e ripetizioni quando il peso è valorizzato', () => {
    expect(formatWeightSet({ weight: 62.5, weightMode: 'total', repetitions: 10 })).toBe('62,5 kg × 10 rep')
  })

  it('nasconde il peso quando vale zero', () => {
    expect(formatWeightSet({ weight: 0, weightMode: 'total', repetitions: 10 })).toBe('10 rep')
  })

  it('mantiene la modalità per parte senza mostrare il peso zero', () => {
    expect(formatWeightSet({ weight: 0, weightMode: 'per_side', repetitions: 8 }, true)).toBe('8 rep per parte')
  })

  it('include la modalità nei riepiloghi completi', () => {
    expect(formatWeightSet({ weight: 12, weightMode: 'per_side', repetitions: 8 }, true)).toBe('12 kg per parte × 8 rep')
  })
})
