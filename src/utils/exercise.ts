export function normalizeExerciseName(name: string): string {
  return name.trim().replace(/\s+/g, ' ').toLocaleLowerCase('it-IT')
}

export function cleanExerciseName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}
