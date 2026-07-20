import { db as defaultDb, type GymTrackerDatabase } from '@/db/database'
import type { Exercise, ExerciseType, ExerciseWithLastUse } from '@/models'
import { cleanExerciseName, normalizeExerciseName } from '@/utils/exercise'
import { createId } from '@/utils/id'

export class DuplicateExerciseError extends Error {
  constructor() { super('Esiste già un esercizio con questo nome e tipo.') }
}

export class ExerciseRepository {
  constructor(private readonly database: GymTrackerDatabase = defaultDb) {}

  async list(options: { type?: ExerciseType; active?: boolean; search?: string } = {}): Promise<Exercise[]> {
    const normalizedSearch = options.search ? normalizeExerciseName(options.search) : ''
    const items = await this.database.exercises.toArray()
    return items
      .filter((item) => options.type ? item.type === options.type : true)
      .filter((item) => options.active === undefined ? true : item.active === options.active)
      .filter((item) => normalizedSearch ? item.normalizedName.includes(normalizedSearch) : true)
      .sort((a, b) => a.name.localeCompare(b.name, 'it-IT'))
  }

  get(id: string): Promise<Exercise | undefined> {
    return this.database.exercises.get(id)
  }

  async findEquivalent(name: string, type: ExerciseType): Promise<Exercise | undefined> {
    return this.database.exercises.where('[type+normalizedName]').equals([type, normalizeExerciseName(name)]).first()
  }

  async create(name: string, type: ExerciseType): Promise<Exercise> {
    const cleanedName = cleanExerciseName(name)
    if (!cleanedName) throw new Error('Il nome dell’esercizio è obbligatorio.')
    if (await this.findEquivalent(cleanedName, type)) throw new DuplicateExerciseError()
    const now = new Date().toISOString()
    const exercise: Exercise = { id: createId(), name: cleanedName, normalizedName: normalizeExerciseName(cleanedName), type, active: true, createdAt: now, updatedAt: now }
    await this.database.exercises.add(exercise)
    return exercise
  }

  async findOrCreate(name: string, type: ExerciseType): Promise<Exercise> {
    const equivalent = await this.findEquivalent(name, type)
    if (equivalent) return equivalent
    return this.create(name, type)
  }

  async update(id: string, changes: { name: string; type: ExerciseType }): Promise<Exercise> {
    const current = await this.get(id)
    if (!current) throw new Error('Esercizio non trovato.')
    const cleanedName = cleanExerciseName(changes.name)
    if (!cleanedName) throw new Error('Il nome dell’esercizio è obbligatorio.')
    const equivalent = await this.findEquivalent(cleanedName, changes.type)
    if (equivalent && equivalent.id !== id) throw new DuplicateExerciseError()
    const updated: Exercise = { ...current, ...changes, name: cleanedName, normalizedName: normalizeExerciseName(cleanedName), updatedAt: new Date().toISOString() }
    await this.database.exercises.put(updated)
    return updated
  }

  async setActive(id: string, active: boolean): Promise<void> {
    await this.database.exercises.update(id, { active, updatedAt: new Date().toISOString() })
  }

  async listWithLastUse(): Promise<ExerciseWithLastUse[]> {
    const [exercises, weightLogs, cardioLogs] = await Promise.all([
      this.list(), this.database.weightLogs.toArray(), this.database.cardioLogs.toArray()
    ])
    return exercises.map((exercise) => {
      const dates = [...weightLogs, ...cardioLogs].filter((log) => log.exerciseId === exercise.id).map((log) => log.date).sort().reverse()
      return { ...exercise, lastUsedAt: dates[0] }
    })
  }
}

export const exerciseRepository = new ExerciseRepository()
