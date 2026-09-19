import type { ExerciseWithLastUse, MuscleGroup } from '@/models'

export function selectExerciseSuggestions(
  exercises: ExerciseWithLastUse[],
  completedExerciseIds: Iterable<string> = [],
  limit = 6,
  muscleGroup?: MuscleGroup
): ExerciseWithLastUse[] {
  const completed = new Set(completedExerciseIds)

  return exercises
    .filter((exercise) => exercise.active
      && !completed.has(exercise.id)
      && (!muscleGroup || exercise.primaryMuscleGroup === muscleGroup))
    .sort((a, b) => {
      if (a.lastUsedAt && b.lastUsedAt) {
        const byLastUse = a.lastUsedAt.localeCompare(b.lastUsedAt)
        if (byLastUse) return byLastUse
      } else if (a.lastUsedAt) return -1
      else if (b.lastUsedAt) return 1

      return a.name.localeCompare(b.name, 'it-IT')
    })
    .slice(0, Math.max(0, limit))
}
