import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { GymTrackerDatabase } from '@/db/database'
import { WeightLogRepository } from '@/repositories/weightLogRepository'
import { BackupRepository, validateBackup } from '@/repositories/backupRepository'
import { validateWeightSets } from '@/utils/weightSets'
import { formatWeightSet } from '@/utils/weightDisplay'
import { compressConsecutiveSets, generateWorkoutText } from '@/services/workoutText'
import { calculateWeightStats } from '@/services/statistics'
import type { WeightSetDraft } from '@/models'

const databases: GymTrackerDatabase[] = []
const timed: WeightSetDraft = { weight: 10, weightMode: 'per_side', repetitions: 0, durationSeconds: 90, durationUnit: 'minutes' }
const repeated: WeightSetDraft = { weight: 10, weightMode: 'per_side', repetitions: 12 }
const input = { exerciseId: 'hold', exerciseName: 'Tenuta', date: '2026-09-05', notes: '' }
afterEach(async () => { await Promise.all(databases.splice(0).map(db => db.delete())) })

describe('serie pesi a tempo', () => {
  it('valida durate positive e mantiene le regole delle ripetizioni', () => {
    expect(validateWeightSets([timed, repeated, { ...timed, durationSeconds: 0.5 }])).toEqual({})
    for (const durationSeconds of [0, -1, NaN, Infinity]) {
      expect(validateWeightSets([{ ...timed, durationSeconds }])[0]?.duration).toBeTruthy()
    }
    expect(validateWeightSets([{ ...timed, repetitions: 10 }])[0]?.repetitions).toBeTruthy()
    expect(validateWeightSets([{ ...repeated, repetitions: 1.5 }])[0]?.repetitions).toBeTruthy()
  })

  it('mostra durata e carico, anche senza peso', () => {
    expect(formatWeightSet(timed, true)).toBe('10 kg per parte × 1,5 min')
    expect(formatWeightSet({ ...timed, weight: 0, durationUnit: 'seconds' }, true)).toBe('90 s per parte')
    expect(formatWeightSet({ ...timed, weight: 0, weightMode: 'total' })).toBe('1,5 min')
  })

  it('comprime durate equivalenti e distingue serie a tempo diverse e ripetizioni', () => {
    const runs = compressConsecutiveSets([timed, { ...timed, durationUnit: 'seconds' }, { ...timed, durationSeconds: 45 }, repeated])
    expect(runs.map(run => run.count)).toEqual([2, 1, 1])
  })

  it('conserva durata e unità in salvataggio, aggiunta, backup, modifica e condivisione', async () => {
    const db = new GymTrackerDatabase(`timed-${crypto.randomUUID()}`)
    databases.push(db)
    const repo = new WeightLogRepository(db)
    const backup = new BackupRepository(db)
    const saved = await repo.save({ ...input, sets: [repeated, timed] })
    const appended = await repo.appendSets(saved.id, [{ ...timed, durationUnit: 'seconds' }])
    expect(appended.sets[1]).toMatchObject(timed)
    expect(appended.sets[2]).toMatchObject({ durationSeconds: 90, durationUnit: 'seconds' })
    const stats = calculateWeightStats([appended])[0]!
    expect(stats).toMatchObject({ totalSets: 3 })
    expect(stats.modes[0]).toMatchObject({ maxRepetitions: 12, maxDurationSeconds: 90 })
    for (const format of ['full', 'compact'] as const) {
      const text = generateWorkoutText({ date: input.date, weightLogs: [appended], cardioLogs: [], format })
      expect(text).toContain('1,5 min')
      expect(text).toContain('12 rep')
      expect(text).not.toContain('90 rep')
    }
    const exported = await backup.export()
    expect(validateBackup(exported)).toBe(true)
    expect(validateBackup({ ...exported, weightSets: [{ ...appended.sets[1], durationSeconds: -1 }] })).toBe(false)
    await backup.restore(exported)
    expect((await repo.get(saved.id))?.sets[1]).toMatchObject(timed)
    const updated = await repo.save({ ...appended, sets: [repeated] })
    expect(updated.sets[0]?.durationSeconds).toBeUndefined()
    await expect(repo.save({ ...input, sets: [{ ...timed, durationSeconds: 0 }] })).rejects.toThrow()
  })
})
