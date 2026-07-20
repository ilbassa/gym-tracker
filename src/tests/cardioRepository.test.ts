import 'fake-indexeddb/auto'
import { afterEach,describe,expect,it } from 'vitest'
import { GymTrackerDatabase } from '@/db/database'
import { CardioLogRepository } from '@/repositories/cardioLogRepository'
const databases:GymTrackerDatabase[]=[]
function setup(){const db=new GymTrackerDatabase(`cardio-test-${crypto.randomUUID()}`);databases.push(db);return new CardioLogRepository(db)}
afterEach(async()=>{await Promise.all(databases.splice(0).map(db=>db.delete()))})
describe('repository cardio',()=>{
 it('crea, modifica ed elimina una registrazione',async()=>{const repo=setup();const saved=await repo.save({exerciseId:'bike',exerciseName:'Cyclette',date:'2026-07-20',minutes:20,notes:''});const updated=await repo.save({...saved,minutes:25});expect(updated.minutes).toBe(25);expect(await repo.listByDate('2026-07-20')).toHaveLength(1);await repo.delete(saved.id);expect(await repo.get(saved.id)).toBeUndefined()})
 it('rifiuta minuti non interi o non positivi',async()=>{const repo=setup(),base={exerciseId:'bike',exerciseName:'Cyclette',date:'2026-07-20',notes:''};await expect(repo.save({...base,minutes:0})).rejects.toThrow();await expect(repo.save({...base,minutes:2.5})).rejects.toThrow()})
 it('salva un circuito e calcola la durata complessiva',async()=>{const repo=setup();const saved=await repo.save({exerciseId:'tabata',exerciseName:'TABATA',date:'2026-07-20',minutes:0,notes:'',mode:'intervals',interval:{workSeconds:20,restSeconds:10,sets:3,restBetweenSetsSeconds:90,exercises:['Jumping Jack','Skip','Climbers','Squat Jump']}});expect(saved.minutes).toBe(8.5);expect(saved.interval?.sets).toBe(3)})
})
