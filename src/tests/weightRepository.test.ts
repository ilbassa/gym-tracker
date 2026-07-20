import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { GymTrackerDatabase } from '@/db/database'
import { WeightLogRepository } from '@/repositories/weightLogRepository'

const databases: GymTrackerDatabase[] = []
function setup() { const db = new GymTrackerDatabase(`weight-test-${crypto.randomUUID()}`); databases.push(db); return { db, logs: new WeightLogRepository(db) } }
afterEach(async () => { await Promise.all(databases.splice(0).map((database) => database.delete())) })

describe('repository registrazioni pesi', () => {
  it('salva le serie con posizione progressiva e le legge ordinate', async () => {
    const { logs } = setup()
    const saved = await logs.save({ exerciseId: 'panca', exerciseName: 'Panca piana', date: '2026-07-20', notes: '', sets: [
      { weight: 60, weightMode: 'total', repetitions: 10 }, { weight: 62.5, weightMode: 'total', repetitions: 8 }
    ] })
    expect(saved.sets.map((set) => set.position)).toEqual([1, 2])
  })

  it('in modifica sostituisce le serie in una singola transazione', async () => {
    const { logs } = setup()
    const saved = await logs.save({ exerciseId: 'panca', exerciseName: 'Panca piana', date: '2026-07-20', notes: '', sets: [{ weight: 60, weightMode: 'total', repetitions: 10 }] })
    const updated = await logs.save({ ...saved, notes: 'Tecnica', sets: [{ weight: 65, weightMode: 'per_side', repetitions: 6 }] })
    expect(updated.notes).toBe('Tecnica')
    expect(updated.sets).toHaveLength(1)
    expect(updated.sets[0]).toMatchObject({ weight: 65, weightMode: 'per_side', position: 1 })
  })

  it('elimina registrazione e relative serie senza eliminare altri dati', async () => {
    const { db, logs } = setup()
    const saved = await logs.save({ exerciseId: 'panca', exerciseName: 'Panca piana', date: '2026-07-20', notes: '', sets: [{ weight: 60, weightMode: 'total', repetitions: 10 }] })
    await logs.delete(saved.id)
    expect(await logs.get(saved.id)).toBeUndefined()
    expect(await db.weightSets.count()).toBe(0)
  })

  it('rifiuta peso e ripetizioni non validi', async () => {
    const { logs } = setup()
    const base = { exerciseId: 'panca', exerciseName: 'Panca piana', date: '2026-07-20', notes: '' }
    await expect(logs.save({ ...base, sets: [{ weight: -1, weightMode: 'total', repetitions: 10 }] })).rejects.toThrow()
    await expect(logs.save({ ...base, sets: [{ weight: 60, weightMode: 'total', repetitions: 0 }] })).rejects.toThrow()
  })
})
