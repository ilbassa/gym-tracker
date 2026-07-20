import type { WeightSetDraft } from '@/models'

export function duplicateLastSet<T extends object>(sets: T[], empty: T): T[] {
  const last = sets.at(-1)
  return last ? [...sets, { ...last }] : [{ ...empty }]
}

export function validateWeightSets(sets: WeightSetDraft[]): Record<number, { weight?: string; repetitions?: string }> {
  return Object.fromEntries(sets.map((set, index) => {
    const errors: { weight?: string; repetitions?: string } = {}
    if (!Number.isFinite(set.weight) || set.weight < 0) errors.weight = 'Inserisci un peso maggiore o uguale a zero.'
    if (!Number.isInteger(set.repetitions) || set.repetitions <= 0) errors.repetitions = 'Inserisci ripetizioni intere maggiori di zero.'
    return [index, errors]
  }).filter(([, errors]) => Object.keys(errors as object).length))
}
