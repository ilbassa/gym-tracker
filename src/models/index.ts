export type ExerciseType = 'weights' | 'cardio'
export const muscleGroups = ['petto', 'spalle', 'dorso', 'braccia', 'gambe', 'core'] as const
export type MuscleGroup = typeof muscleGroups[number]
export type WeightMode = 'total' | 'per_side'
export type DurationUnit = 'seconds' | 'minutes'
export type CardioMode = 'duration' | 'intervals'

export interface CardioIntervalDetails {
  workSeconds: number
  restSeconds: number
  sets: number
  restBetweenSetsSeconds: number
  exercises: string[]
}

export interface CircuitExerciseSuggestion {
  id: string
  name: string
  normalizedName: string
  createdAt: string
  updatedAt: string
}

export interface Exercise {
  id: string
  name: string
  normalizedName: string
  type: ExerciseType
  primaryMuscleGroup?: MuscleGroup
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface WeightLog {
  id: string
  exerciseId: string
  exerciseName: string
  date: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface WeightSet {
  id: string
  weightLogId: string
  position: number
  weight: number
  weightMode: WeightMode
  repetitions: number
  durationSeconds?: number
  durationUnit?: DurationUnit
  createdAt: string
  updatedAt: string
}

export interface CardioLog {
  id: string
  exerciseId: string
  exerciseName: string
  date: string
  minutes: number
  mode?: CardioMode
  interval?: CardioIntervalDetails
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Settings {
  theme: 'system' | 'light' | 'dark'
  defaultWeightMode: WeightMode
  exportFormat: 'full' | 'compact'
  showExportDate: boolean
  googleDriveLastSyncAt?: string
}

export interface SettingsRecord {
  key: 'app'
  value: Settings
}

export interface WeightLogWithSets extends WeightLog {
  sets: WeightSet[]
}

export interface ExerciseWithLastUse extends Exercise {
  lastUsedAt?: string
}

export interface WeightSetDraft {
  weight: number
  weightMode: WeightMode
  repetitions: number
  durationSeconds?: number
  durationUnit?: DurationUnit
}
