import { db as defaultDb, type GymTrackerDatabase } from '@/db/database'
import type { CircuitExerciseSuggestion } from '@/models'
import { cleanExerciseName, normalizeExerciseName } from '@/utils/exercise'
import { createId } from '@/utils/id'

export class CircuitExerciseRepository {
  constructor(private readonly database: GymTrackerDatabase = defaultDb) {}

  async list(): Promise<CircuitExerciseSuggestion[]> {
    return (await this.database.circuitExercises.toArray()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.name.localeCompare(b.name, 'it-IT'))
  }

  async remember(names: string[]): Promise<void> {
    const unique = new Map<string, string>()
    for (const value of names) {
      const name = cleanExerciseName(value)
      const normalized = normalizeExerciseName(name)
      if (normalized) unique.set(normalized, name)
    }
    if (!unique.size) return

    const now = new Date().toISOString()
    await this.database.transaction('rw', this.database.circuitExercises, async () => {
      for (const [normalizedName, name] of unique) {
        const existing = await this.database.circuitExercises.where('normalizedName').equals(normalizedName).first()
        const suggestion: CircuitExerciseSuggestion = existing
          ? { ...existing, name, updatedAt: now }
          : { id: createId(), name, normalizedName, createdAt: now, updatedAt: now }
        await this.database.circuitExercises.put(suggestion)
      }
    })
  }
}

export const circuitExerciseRepository = new CircuitExerciseRepository()
