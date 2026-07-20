import type { CardioLog, WeightLogWithSets } from '@/models'

export interface HistoryFilters { from?: string; to?: string; type: 'all' | 'weights' | 'cardio'; exerciseId?: string }
export interface HistoryDay { date: string; weightLogs: WeightLogWithSets[]; cardioLogs: CardioLog[]; weightExercises: number; totalSets: number; cardioMinutes: number }

export function filterByDateRange<T extends { date: string }>(items: T[], from?: string, to?: string): T[] {
  return items.filter((item) => (!from || item.date >= from) && (!to || item.date <= to))
}

export function buildHistoryDays(weightLogs: WeightLogWithSets[], cardioLogs: CardioLog[], filters: HistoryFilters): HistoryDay[] {
  const weights = filters.type === 'cardio' ? [] : filterByDateRange(weightLogs, filters.from, filters.to).filter((log) => !filters.exerciseId || log.exerciseId === filters.exerciseId)
  const cardio = filters.type === 'weights' ? [] : filterByDateRange(cardioLogs, filters.from, filters.to).filter((log) => !filters.exerciseId || log.exerciseId === filters.exerciseId)
  const dates = [...new Set([...weights.map((log) => log.date), ...cardio.map((log) => log.date)])].sort().reverse()
  return dates.map((date) => {
    const dayWeights = weights.filter((log) => log.date === date)
    const dayCardio = cardio.filter((log) => log.date === date)
    return { date, weightLogs: dayWeights, cardioLogs: dayCardio, weightExercises: dayWeights.length, totalSets: dayWeights.reduce((sum, log) => sum + log.sets.length, 0), cardioMinutes: dayCardio.reduce((sum, log) => sum + log.minutes, 0) }
  })
}
