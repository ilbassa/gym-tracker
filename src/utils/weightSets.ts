import type { WeightSetDraft } from '@/models'

export function duplicateLastSet<T extends object>(sets: T[], empty: T): T[] {
  const last = sets.at(-1)
  return last ? [...sets, { ...last }] : [{ ...empty }]
}

export function validateWeightSets(sets: WeightSetDraft[]): Record<number, { weight?: string; repetitions?: string; duration?: string }> {
  return Object.fromEntries(sets.map((set, index) => {
    const errors: { weight?: string; repetitions?: string; duration?: string } = {}
    if (!Number.isFinite(set.weight) || set.weight < 0) errors.weight = 'Inserisci un peso maggiore o uguale a zero.'
    if (set.durationSeconds !== undefined) {
      if (!Number.isFinite(set.durationSeconds) || set.durationSeconds <= 0) errors.duration = 'Inserisci una durata maggiore di zero.'
      if (set.durationUnit !== undefined && set.durationUnit !== 'seconds' && set.durationUnit !== 'minutes') errors.duration = 'Scegli secondi o minuti.'
      if (set.repetitions !== 0) errors.repetitions = 'Una serie a tempo non può avere ripetizioni.'
    } else if (!Number.isInteger(set.repetitions) || set.repetitions <= 0) errors.repetitions = 'Inserisci ripetizioni intere maggiori di zero.'
    return [index, errors]
  }).filter(([, errors]) => Object.keys(errors as object).length))
}
