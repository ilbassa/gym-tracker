import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { GymTrackerDatabase } from '@/db/database'
import { DuplicateExerciseError, ExerciseRepository } from '@/repositories/exerciseRepository'
import { cleanExerciseName, normalizeExerciseName } from '@/utils/exercise'

const databases: GymTrackerDatabase[] = []

function repository() {
  const database = new GymTrackerDatabase(`test-${crypto.randomUUID()}`)
  databases.push(database)
  return new ExerciseRepository(database)
}

afterEach(async () => { await Promise.all(databases.splice(0).map((database) => database.delete())) })

describe('nomi esercizi', () => {
  it('normalizza spazi e maiuscole', () => {
    expect(normalizeExerciseName('  PANCA   Piana ')).toBe('panca piana')
    expect(cleanExerciseName('  Panca   piana ')).toBe('Panca piana')
  })

  it('impedisce duplicati equivalenti nello stesso tipo', async () => {
    const exercises = repository()
    await exercises.create('Panca piana', 'weights')
    await expect(exercises.create('  PANCA   PIANA ', 'weights')).rejects.toBeInstanceOf(DuplicateExerciseError)
  })

  it('mantiene separati esercizi pesi e cardio', async () => {
    const exercises = repository()
    await exercises.create('Stepper', 'weights')
    await expect(exercises.create('STEPPER', 'cardio')).resolves.toMatchObject({ type: 'cardio' })
  })

  it('salva il gruppo muscolare principale durante la modifica', async () => {
    const exercises = repository()
    const exercise = await exercises.create('Panca piana', 'weights')

    await expect(exercises.update(exercise.id, {
      name: exercise.name,
      type: exercise.type,
      primaryMuscleGroup: 'petto'
    })).resolves.toMatchObject({ primaryMuscleGroup: 'petto' })
  })
})
