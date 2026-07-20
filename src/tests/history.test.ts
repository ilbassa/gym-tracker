import { describe, expect, it } from 'vitest'
import { buildHistoryDays, filterByDateRange } from '@/services/history'
import type { CardioLog, WeightLogWithSets } from '@/models'
const base={createdAt:'2026-07-01T10:00:00Z',updatedAt:'2026-07-01T10:00:00Z',notes:''}
const weight=(id:string,date:string,exerciseId='panca'):WeightLogWithSets=>({...base,id,date,exerciseId,exerciseName:'Panca',sets:[{...base,id:`s-${id}`,weightLogId:id,position:1,weight:60,weightMode:'total',repetitions:10}]})
const cardio=(id:string,date:string):CardioLog=>({...base,id,date,exerciseId:'bike',exerciseName:'Cyclette',minutes:20})
describe('storico',()=>{
  it('filtra inclusivamente un intervallo di date',()=>expect(filterByDateRange([weight('a','2026-07-01'),weight('b','2026-07-10'),weight('c','2026-07-20')],'2026-07-05','2026-07-15').map(x=>x.id)).toEqual(['b']))
  it('raggruppa e ordina le giornate più recenti prima',()=>{const days=buildHistoryDays([weight('a','2026-07-10'),weight('b','2026-07-20')],[cardio('c','2026-07-20')],{type:'all'});expect(days.map(d=>d.date)).toEqual(['2026-07-20','2026-07-10']);expect(days[0]).toMatchObject({totalSets:1,cardioMinutes:20})})
  it('separa i filtri pesi e cardio',()=>expect(buildHistoryDays([weight('a','2026-07-20')],[cardio('c','2026-07-20')],{type:'cardio'})[0]?.weightLogs).toEqual([]))
})
