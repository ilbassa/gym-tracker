import type { CardioIntervalDetails } from '@/models'

export function calculateIntervalTotalSeconds(details: CardioIntervalDetails): number {
  const exercisesPerSet = details.exercises.length
  if (!exercisesPerSet || details.sets <= 0) return 0
  const oneSet = exercisesPerSet * details.workSeconds + Math.max(0, exercisesPerSet - 1) * details.restSeconds
  return details.sets * oneSet + Math.max(0, details.sets - 1) * details.restBetweenSetsSeconds
}

export function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainder = seconds % 60
  if (!minutes) return `${remainder}″`
  return remainder ? `${minutes}′${String(remainder).padStart(2, '0')}″` : `${minutes}′`
}

export function validateIntervalDetails(details: CardioIntervalDetails): string[] {
  const errors: string[] = []
  if (!Number.isInteger(details.workSeconds) || details.workSeconds <= 0) errors.push('La durata di lavoro deve essere un intero maggiore di zero.')
  if (!Number.isInteger(details.restSeconds) || details.restSeconds < 0) errors.push('La pausa tra esercizi deve essere un intero maggiore o uguale a zero.')
  if (!Number.isInteger(details.sets) || details.sets <= 0) errors.push('Il numero di set deve essere un intero maggiore di zero.')
  if (!Number.isInteger(details.restBetweenSetsSeconds) || details.restBetweenSetsSeconds < 0) errors.push('La pausa tra set deve essere un intero maggiore o uguale a zero.')
  if (!details.exercises.length || details.exercises.some((name) => !name.trim())) errors.push('Inserisci almeno un esercizio per il circuito.')
  return errors
}
