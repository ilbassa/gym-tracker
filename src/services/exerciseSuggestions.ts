import type { ExerciseWithLastUse } from '@/models'

export function selectExerciseSuggestions(
  exercises: ExerciseWithLastUse[],
  completedExerciseIds: Iterable<string> = [],
  limit = 3
): ExerciseWithLastUse[] {
  const completed = new Set(completedExerciseIds)

  return exercises
    .filter((exercise) => exercise.active && !completed.has(exercise.id))
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
