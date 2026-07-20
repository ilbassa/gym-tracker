import { db as defaultDb, type GymTrackerDatabase } from '@/db/database'
import type { CardioIntervalDetails, CardioLog, CardioMode } from '@/models'
import { calculateIntervalTotalSeconds, validateIntervalDetails } from '@/services/cardioIntervals'
import { createId } from '@/utils/id'

export interface SaveCardioLogInput {
  id?: string
  exerciseId: string
  exerciseName: string
  date: string
  minutes: number
  mode?: CardioMode
  interval?: CardioIntervalDetails
  notes: string
}

export class CardioLogRepository {
  constructor(private readonly database: GymTrackerDatabase = defaultDb) {}

  get(id: string): Promise<CardioLog | undefined> { return this.database.cardioLogs.get(id) }
  listByDate(date: string): Promise<CardioLog[]> { return this.database.cardioLogs.where('date').equals(date).sortBy('createdAt') }

  async listBetween(from?: string, to?: string): Promise<CardioLog[]> {
    const logs = await this.database.cardioLogs.toArray()
    return logs.filter((log) => (!from || log.date >= from) && (!to || log.date <= to)).sort((a, b) => b.date.localeCompare(a.date) || a.createdAt.localeCompare(b.createdAt))
  }

  async getLatestForExercise(exerciseId: string, beforeDate?: string, excludeId?: string): Promise<CardioLog | undefined> {
    const logs = await this.database.cardioLogs.where('exerciseId').equals(exerciseId).toArray()
    return logs.filter((log) => log.id !== excludeId && (!beforeDate || log.date <= beforeDate)).sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))[0]
  }

  async save(input: SaveCardioLogInput): Promise<CardioLog> {
    const mode = input.mode ?? 'duration'
    if (mode === 'duration' && (!Number.isInteger(input.minutes) || input.minutes <= 0)) throw new Error('I minuti devono essere interi e maggiori di zero.')
    if (mode === 'intervals') {
      if (!input.interval) throw new Error('Inserisci i dettagli dell’allenamento a intervalli.')
      const errors = validateIntervalDetails(input.interval)
      if (errors.length) throw new Error(errors[0])
      input.minutes = Number((calculateIntervalTotalSeconds(input.interval) / 60).toFixed(2))
    }
    const existing = input.id ? await this.get(input.id) : undefined
    const now = new Date().toISOString()
    const log: CardioLog = { id: input.id ?? createId(), exerciseId: input.exerciseId, exerciseName: input.exerciseName, date: input.date, minutes: input.minutes, mode, interval: mode === 'intervals' ? input.interval : undefined, notes: input.notes.trim(), createdAt: existing?.createdAt ?? now, updatedAt: now }
    await this.database.cardioLogs.put(log)
    return log
  }

  async delete(id: string): Promise<void> { await this.database.cardioLogs.delete(id) }
}

export const cardioLogRepository = new CardioLogRepository()
