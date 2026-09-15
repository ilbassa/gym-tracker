import { describe, expect, it } from 'vitest'
import { selectExerciseSuggestions } from '@/services/exerciseSuggestions'
import type { ExerciseWithLastUse } from '@/models'

const stamp = '2026-09-15T10:00:00.000Z'
function exercise(id: string, name: string, lastUsedAt?: string, active = true): ExerciseWithLastUse {
  return { id, name, normalizedName: name.toLocaleLowerCase('it-IT'), type: 'weights', active, createdAt: stamp, updatedAt: stamp, lastUsedAt }
}

describe('suggerimenti esercizi', () => {
  it('mette prima gli esercizi usati meno recentemente', () => {
    const result = selectExerciseSuggestions([
      exercise('recent', 'Squat', '2026-09-10'),
      exercise('oldest', 'Panca', '2026-07-01'),
      exercise('middle', 'Rematore', '2026-08-12')
    ])

    expect(result.map((item) => item.id)).toEqual(['oldest', 'middle', 'recent'])
  })

  it('esclude esercizi inattivi e quelli già svolti oggi', () => {
    const result = selectExerciseSuggestions([
      exercise('done', 'Panca', '2026-07-01'),
      exercise('inactive', 'Affondi', '2026-06-01', false),
      exercise('available', 'Squat', '2026-08-01')
    ], ['done'])

    expect(result.map((item) => item.id)).toEqual(['available'])
  })

  it('usa gli esercizi mai registrati come alternativa e rispetta il limite', () => {
    const result = selectExerciseSuggestions([
      exercise('used', 'Panca', '2026-07-01'),
      exercise('never-b', 'Squat'),
      exercise('never-a', 'Affondi')
    ], [], 2)

    expect(result.map((item) => item.id)).toEqual(['used', 'never-a'])
  })
})
