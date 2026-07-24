import type { WeightSet } from '@/models'
import { formatNumber } from '@/utils/number'

type DisplayWeightSet = Pick<WeightSet, 'weight' | 'weightMode' | 'repetitions'>

export function formatWeightSet(set: DisplayWeightSet, includeMode = false): string {
  const repetitions = `${formatNumber(set.repetitions)} rep`

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
