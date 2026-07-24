import { describe,expect,it } from 'vitest'
import { calculateCardioStats,calculateGeneralStats,calculateMuscleGroupStats,calculateWeightStats,weightProgressPoints } from '@/services/statistics'
import type { CardioLog,Exercise,WeightLogWithSets,WeightMode } from '@/models'
const stamp={createdAt:'2026-07-01T10:00:00Z',updatedAt:'2026-07-01T10:00:00Z',notes:''}
const log=(id:string,date:string,values:Array<[number,number,WeightMode]>):WeightLogWithSets=>({...stamp,id,date,exerciseId:'panca',exerciseName:'Panca',sets:values.map(([weight,repetitions,weightMode],i)=>({...stamp,id:`${id}-${i}`,weightLogId:id,position:i+1,weight,repetitions,weightMode}))})
const cardio=(id:string,date:string,minutes:number):CardioLog=>({...stamp,id,date,exerciseId:'bike',exerciseName:'Cyclette',minutes})
describe('statistiche',()=>{
 it('calcola le statistiche generali',()=>expect(calculateGeneralStats([log('a','2026-07-01',[[60,10,'total']])],[cardio('c','2026-07-02',20)],'2026-07-01','2026-07-07')).toMatchObject({trainingDays:2,weightLogs:1,totalSets:1,cardioMinutes:20,weeklyFrequency:2}))
 it('calcola statistiche pesi',()=>{const result=calculateWeightStats([log('a','2026-07-01',[[60,10,'total']]),log('b','2026-07-02',[[65,8,'total']])])[0]!;expect(result).toMatchObject({sessions:2,totalSets:2});expect(result.modes[0]).toMatchObject({maxWeight:65,maxRepetitions:10,latestWeight:65})})
 it('separa peso totale e per parte',()=>{const modes=calculateWeightStats([log('a','2026-07-01',[[60,10,'total'],[30,12,'per_side']])])[0]!.modes;expect(modes).toHaveLength(2);expect(modes.map(m=>[m.mode,m.maxWeight])).toEqual([['total',60],['per_side',30]])})
 it('calcola statistiche cardio',()=>expect(calculateCardioStats([cardio('a','2026-07-01',20),cardio('b','2026-07-02',40)])[0]).toMatchObject({sessions:2,totalMinutes:60,averageMinutes:30,maxMinutes:40,lastDate:'2026-07-02'}))
 it('raggruppa sessioni, serie ed esercizi per gruppo muscolare',()=>{
  const exercises:Exercise[]=[
   {id:'panca',name:'Panca',normalizedName:'panca',type:'weights',primaryMuscleGroup:'petto',active:true,...stamp},
   {id:'croci',name:'Croci',normalizedName:'croci',type:'weights',primaryMuscleGroup:'petto',active:true,...stamp},
   {id:'squat',name:'Squat',normalizedName:'squat',type:'weights',primaryMuscleGroup:'gambe',active:true,...stamp},
   {id:'curl',name:'Curl',normalizedName:'curl',type:'weights',active:true,...stamp}
  ]
  const logs=[
   log('a','2026-07-01',[[60,10,'total'],[60,8,'total']]),
   {...log('b','2026-07-02',[[20,12,'total']]),exerciseId:'croci',exerciseName:'Croci'},
   {...log('c','2026-07-03',[[80,8,'total']]),exerciseId:'squat',exerciseName:'Squat'},
   {...log('d','2026-07-04',[[10,10,'per_side']]),exerciseId:'curl',exerciseName:'Curl'}
  ]
  expect(calculateMuscleGroupStats(logs,exercises)).toEqual({
   groups:[
   {group:'petto',sessions:2,totalSets:3,exerciseCount:2},
    {group:'gambe',sessions:1,totalSets:1,exerciseCount:1}
   ],
   mostFrequent:'petto',
   unassignedLogs:1,
   unassignedSets:1
  })
 })
 it('non mescola le modalità nel grafico pesi',()=>expect(weightProgressPoints([log('a','2026-07-01',[[60,10,'total'],[30,10,'per_side']])],'panca','per_side')).toEqual([{label:'2026-07-01',value:30}]))
})
