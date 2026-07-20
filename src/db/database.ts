import Dexie, { type EntityTable } from 'dexie'
import type { CardioLog, CircuitExerciseSuggestion, Exercise, SettingsRecord, WeightLog, WeightSet } from '@/models'

export class GymTrackerDatabase extends Dexie {
  exercises!: EntityTable<Exercise, 'id'>
  weightLogs!: EntityTable<WeightLog, 'id'>
  weightSets!: EntityTable<WeightSet, 'id'>
  cardioLogs!: EntityTable<CardioLog, 'id'>
  circuitExercises!: EntityTable<CircuitExerciseSuggestion, 'id'>
  settings!: EntityTable<SettingsRecord, 'key'>

  constructor(name = 'gym-tracker') {
    super(name)
    this.version(1).stores({
      exercises: '&id, &[type+normalizedName], type, active, createdAt, updatedAt',
      weightLogs: '&id, exerciseId, date, [date+exerciseId], createdAt',
      weightSets: '&id, weightLogId, [weightLogId+position]',
      cardioLogs: '&id, exerciseId, date, [date+exerciseId], createdAt',
      settings: '&key'
    })
    this.version(2).stores({
      exercises: '&id, &[type+normalizedName], type, active, createdAt, updatedAt',
      weightLogs: '&id, exerciseId, date, [date+exerciseId], createdAt',
      weightSets: '&id, weightLogId, [weightLogId+position]',
      cardioLogs: '&id, exerciseId, date, [date+exerciseId], createdAt',
      circuitExercises: '&id, &normalizedName, updatedAt',
      settings: '&key'
    })
  }
}

export const db = new GymTrackerDatabase()
