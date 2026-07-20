import type { CardioLog, WeightLogWithSets, WeightSet } from '@/models'
import { formatItalianDate } from '@/utils/date'
import { formatNumber } from '@/utils/number'
import { formatSeconds } from '@/services/cardioIntervals'

export interface SetRun { set: Pick<WeightSet, 'weight' | 'weightMode' | 'repetitions'>; count: number }
export interface WorkoutTextInput { date: string; weightLogs: WeightLogWithSets[]; cardioLogs: CardioLog[]; format: 'full' | 'compact'; showDate?: boolean }

export function compressConsecutiveSets(sets: Array<Pick<WeightSet, 'weight' | 'weightMode' | 'repetitions'>>): SetRun[] {
  return sets.reduce<SetRun[]>((runs, set) => {
    const last = runs.at(-1)
    if (last && last.set.weight === set.weight && last.set.weightMode === set.weightMode && last.set.repetitions === set.repetitions) last.count++
    else runs.push({ set, count: 1 })
    return runs
  }, [])
}

function groupedWeights(logs: WeightLogWithSets[]): Array<{ name: string; sets: WeightSet[] }> {
  const groups = new Map<string, { name: string; sets: WeightSet[] }>()
  for (const log of logs) {
    const group = groups.get(log.exerciseId) ?? { name: log.exerciseName, sets: [] }
    group.sets.push(...log.sets)
    groups.set(log.exerciseId, group)
  }
  return [...groups.values()]
}

function fullWeightLine(name: string, sets: WeightSet[]): string {
  return `${name}: ${sets.map((set) => `${formatNumber(set.weight)} kg ${set.weightMode === 'total' ? 'totali' : 'per parte'} × ${set.repetitions}`).join('; ')}`
}

function compactWeightLine(name: string, sets: WeightSet[]): string {
  const modes = new Set(sets.map((set) => set.weightMode))
  const sameMode = modes.size <= 1
  const tokens = compressConsecutiveSets(sets).map(({ set, count }) => {
    const core = `${formatNumber(set.weight)} kg×${set.repetitions}`
    const token = count > 1 ? `${count}×(${core})` : core
    if (sameMode) return token
    return `${token} ${set.weightMode === 'total' ? 'tot.' : 'per parte'}`
  })
  const suffix = sameMode && sets[0]?.weightMode === 'per_side' ? ' per parte' : ''
  return `${name}: ${tokens.join(', ')}${suffix}`
}

function cardioLine(log: CardioLog, format: 'full' | 'compact'): string {
  if ((log.mode ?? 'duration') === 'intervals' && log.interval) {
    const details = log.interval
    const exercises = details.exercises.join(', ')
    const core = format === 'full'
      ? `${details.sets} set; ${formatSeconds(details.workSeconds)} lavoro; ${formatSeconds(details.restSeconds)} pausa tra esercizi; ${formatSeconds(details.restBetweenSetsSeconds)} pausa tra set; esercizi: ${exercises}`
      : `${details.sets} set × [${exercises}] · ${formatSeconds(details.workSeconds)}/${formatSeconds(details.restSeconds)} · pausa set ${formatSeconds(details.restBetweenSetsSeconds)}`
    return `${log.exerciseName}: ${core}${log.notes ? ` — ${log.notes}` : ''}`
  }
  return `${log.exerciseName}: ${formatNumber(log.minutes)} min${log.notes ? ` — ${log.notes}` : ''}`
}

export function generateWorkoutText(input: WorkoutTextInput): string {
  const date = formatItalianDate(input.date, { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })
  const title = input.showDate === false ? 'Allenamento' : `Allenamento di ${date}`
  const weightLines = groupedWeights(input.weightLogs).map((group) => input.format === 'full' ? fullWeightLine(group.name, group.sets) : compactWeightLine(group.name, group.sets))
  const cardioLines = input.cardioLogs.map((log) => cardioLine(log, input.format))
  const lines = [...weightLines, ...cardioLines]
  return lines.length ? `${title}\n\n${lines.join('\n')}` : title
}
