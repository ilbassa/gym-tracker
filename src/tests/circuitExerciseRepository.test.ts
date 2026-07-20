import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { GymTrackerDatabase } from '@/db/database'
import { CircuitExerciseRepository } from '@/repositories/circuitExerciseRepository'

const databases: GymTrackerDatabase[] = []

function setup() {
  const db = new GymTrackerDatabase(`circuit-exercise-test-${crypto.randomUUID()}`)
  databases.push(db)
  return new CircuitExerciseRepository(db)
}

afterEach(async () => { await Promise.all(databases.splice(0).map((db) => db.delete())) })

describe('suggerimenti esercizi circuito', () => {
  it('ricorda e restituisce gli esercizi inseriti', async () => {
    const repository = setup()
    await repository.remember(['Jumping Jack', 'Skip'])
    expect((await repository.list()).map((item) => item.name).sort()).toEqual(['Jumping Jack', 'Skip'])
  })

  it('deduplica nomi equivalenti', async () => {
    const repository = setup()
    await repository.remember(['Jumping Jack', ' jumping   jack '])
    expect(await repository.list()).toHaveLength(1)
  })
})
