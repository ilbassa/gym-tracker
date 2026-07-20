import { db as defaultDb, type GymTrackerDatabase } from '@/db/database'
import type { WeightLog, WeightLogWithSets, WeightSetDraft } from '@/models'
import { createId } from '@/utils/id'

export interface SaveWeightLogInput {
  id?: string
  exerciseId: string
  exerciseName: string
  date: string
  notes: string
  sets: WeightSetDraft[]
}

export class WeightLogRepository {
  constructor(private readonly database: GymTrackerDatabase = defaultDb) {}

  async get(id: string): Promise<WeightLogWithSets | undefined> {
    const log = await this.database.weightLogs.get(id)
    if (!log) return undefined
    return { ...log, sets: await this.database.weightSets.where('weightLogId').equals(id).sortBy('position') }
  }

  async listByDate(date: string): Promise<WeightLogWithSets[]> {
    const logs = await this.database.weightLogs.where('date').equals(date).sortBy('createdAt')
    return Promise.all(logs.map(async (log) => ({ ...log, sets: await this.database.weightSets.where('weightLogId').equals(log.id).sortBy('position') })))
  }

  async listBetween(from?: string, to?: string): Promise<WeightLogWithSets[]> {
    const logs = await this.database.weightLogs.toArray()
    const filtered = logs.filter((log) => (!from || log.date >= from) && (!to || log.date <= to)).sort((a, b) => b.date.localeCompare(a.date) || a.createdAt.localeCompare(b.createdAt))
    return Promise.all(filtered.map(async (log) => ({ ...log, sets: await this.database.weightSets.where('weightLogId').equals(log.id).sortBy('position') })))
  }

  async findSameExerciseOnDate(date: string, exerciseId: string, excludeId?: string): Promise<WeightLogWithSets | undefined> {
    const logs = await this.database.weightLogs.where('[date+exerciseId]').equals([date, exerciseId]).toArray()
    const match = logs.find((log) => log.id !== excludeId)
    return match ? this.get(match.id) : undefined
  }

  async getLatestForExercise(exerciseId: string, beforeDate?: string, excludeId?: string): Promise<WeightLogWithSets | undefined> {
    const logs = await this.database.weightLogs.where('exerciseId').equals(exerciseId).toArray()
    const latest = logs
      .filter((log) => log.id !== excludeId && (!beforeDate || log.date <= beforeDate))
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))[0]
    return latest ? this.get(latest.id) : undefined
  }

  async save(input: SaveWeightLogInput): Promise<WeightLogWithSets> {
    if (!input.sets.length) throw new Error('Aggiungi almeno una serie.')
    if (input.sets.some((set) => !Number.isFinite(set.weight) || set.weight < 0)) throw new Error('Il peso deve essere maggiore o uguale a zero.')
    if (input.sets.some((set) => !Number.isInteger(set.repetitions) || set.repetitions <= 0)) throw new Error('Le ripetizioni devono essere intere e maggiori di zero.')
    const existing = input.id ? await this.database.weightLogs.get(input.id) : undefined
    const now = new Date().toISOString()
    const log: WeightLog = {
      id: input.id ?? createId(), exerciseId: input.exerciseId, exerciseName: input.exerciseName,
      date: input.date, notes: input.notes.trim(), createdAt: existing?.createdAt ?? now, updatedAt: now
    }
    await this.database.transaction('rw', this.database.weightLogs, this.database.weightSets, async () => {
      await this.database.weightLogs.put(log)
      await this.database.weightSets.where('weightLogId').equals(log.id).delete()
      await this.database.weightSets.bulkAdd(input.sets.map((set, index) => ({
        id: createId(), weightLogId: log.id, position: index + 1, weight: set.weight,
        weightMode: set.weightMode, repetitions: set.repetitions, createdAt: now, updatedAt: now
      })))
    })
    return (await this.get(log.id))!
  }

  async appendSets(id: string, sets: WeightSetDraft[]): Promise<WeightLogWithSets> {
    const current = await this.get(id)
    if (!current) throw new Error('Registrazione non trovata.')
    return this.save({ ...current, id, sets: [...current.sets, ...sets].map(({ weight, weightMode, repetitions }) => ({ weight, weightMode, repetitions })) })
  }

  async delete(id: string): Promise<void> {
    await this.database.transaction('rw', this.database.weightLogs, this.database.weightSets, async () => {
      await this.database.weightSets.where('weightLogId').equals(id).delete()
      await this.database.weightLogs.delete(id)
    })
  }
}

export const weightLogRepository = new WeightLogRepository()
