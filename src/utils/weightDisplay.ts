import type { WeightSet } from '@/models'
import { formatNumber } from '@/utils/number'

export type DisplayWeightSet = Pick<WeightSet, 'weight' | 'weightMode' | 'repetitions' | 'durationSeconds' | 'durationUnit'>

export function formatSetQuantity(set: DisplayWeightSet): string {
  if (set.durationSeconds !== undefined) {
    return set.durationUnit === 'minutes'
      ? `${formatNumber(set.durationSeconds / 60)} min`
      : `${formatNumber(set.durationSeconds)} s`
  }
  return `${formatNumber(set.repetitions)} rep`
}

export function formatWeightSet(set: DisplayWeightSet, includeMode = false): string {
  const repetitions = formatSetQuantity(set)

  if (set.weight === 0) {
    return includeMode && set.weightMode === 'per_side'
      ? `${repetitions} per parte`
      : repetitions
  }

  const mode = includeMode
    ? ` ${set.weightMode === 'total' ? 'totali' : 'per parte'}`
    : ''

  return `${formatNumber(set.weight)} kg${mode} × ${repetitions}`
}
