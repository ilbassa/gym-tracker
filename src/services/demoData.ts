import { db } from '@/db/database'
import type { Exercise, ExerciseType } from '@/models'
import { normalizeExerciseName } from '@/utils/exercise'
import { createId } from '@/utils/id'

const demoExercises: Array<[string, ExerciseType]> = [
  ['Panca piana', 'weights'], ['Curl con manubri', 'weights'], ['Leg press', 'weights'],
  ['Cyclette', 'cardio'], ['Tapis roulant', 'cardio']
]

export async function loadDemoExercises(): Promise<number> {
  if (!import.meta.env.DEV) throw new Error('I dati demo sono disponibili solo in sviluppo.')
  const now = new Date().toISOString()
  const existing = await db.exercises.toArray()
  const records: Exercise[] = demoExercises
    .filter(([name, type]) => !existing.some((item) => item.type === type && item.normalizedName === normalizeExerciseName(name)))
    .map(([name, type]) => ({ id: createId(), name, normalizedName: normalizeExerciseName(name), type, active: true, createdAt: now, updatedAt: now }))
  await db.exercises.bulkAdd(records)
  return records.length
}
