import { describe, expect, it } from 'vitest'
import { compressConsecutiveSets, generateWorkoutText } from '@/services/workoutText'
import type { CardioLog, WeightLogWithSets, WeightMode, WeightSet } from '@/models'
const stamp={createdAt:'2026-07-20T10:00:00Z',updatedAt:'2026-07-20T10:00:00Z'}
function sets(values:Array<[number,number,WeightMode?]>):WeightSet[]{return values.map(([weight,repetitions,weightMode='total'],i)=>({...stamp,id:`s${i}`,weightLogId:'w',position:i+1,weight,repetitions,weightMode}))}
function weightLog(values:Array<[number,number,WeightMode?]>,name='Panca piana'):WeightLogWithSets{return{...stamp,id:'w',exerciseId:name,exerciseName:name,date:'2026-07-20',notes:'',sets:sets(values)}}
const cardio:CardioLog={...stamp,id:'c',exerciseId:'bike',exerciseName:'Cyclette',date:'2026-07-20',minutes:20,notes:''}
const tabata:CardioLog={...stamp,id:'tabata',exerciseId:'tabata',exerciseName:'TABATA',date:'2026-07-20',minutes:8.5,notes:'',mode:'intervals',interval:{workSeconds:20,restSeconds:10,sets:3,restBetweenSetsSeconds:90,exercises:['Jumping Jack','Skip','Climbers','Squat Jump']}}
const text=(weights:WeightLogWithSets[],cardioLogs:CardioLog[]=[],format:'full'|'compact'='compact')=>generateWorkoutText({date:'2026-07-20',weightLogs:weights,cardioLogs,format})

describe('compressione serie consecutive',()=>{
  it('lascia una sola serie',()=>expect(compressConsecutiveSets(sets([[60,10]]))).toHaveLength(1))
  it('lascia separate serie tutte diverse',()=>expect(compressConsecutiveSets(sets([[60,10],[60,8],[65,6]]))).toHaveLength(3))
  it('comprime serie identiche consecutive',()=>expect(compressConsecutiveSets(sets([[60,10],[60,10],[60,8]])).map(x=>x.count)).toEqual([2,1]))
  it('mantiene gruppi multipli e non unisce uguaglianze separate',()=>expect(compressConsecutiveSets(sets([[60,10],[60,10],[60,8],[60,10],[60,10]])).map(x=>x.count)).toEqual([2,1,2]))
})

describe('testo allenamento',()=>{
  it('genera il formato completo con peso totale',()=>expect(text([weightLog([[60,10]])],[],'full')).toContain('Panca piana: 60 kg totali × 10'))
  it('mantiene kg e la dicitura per parte',()=>expect(text([weightLog([[12,10,'per_side'],[12,10,'per_side']])])).toContain('2×(12 kg×10) per parte'))
  it('genera esercizi cardio',()=>expect(text([], [cardio])).toContain('Cyclette: 20 min'))
  it('genera una giornata mista con un esercizio per riga',()=>{const result=text([weightLog([[60,10]])],[cardio]);expect(result.split('\n').slice(2)).toEqual(['Panca piana: 60 kg×10','Cyclette: 20 min'])})
  it('mette il giorno della settimana prima della data',()=>expect(text([])).toBe('Allenamento di lunedì 20/07/2026'))
  it('include le note cardio utili per velocità e pendenza',()=>expect(text([],[{...cardio,notes:'velocità 6, pendenza 2%'}])).toContain('Cyclette: 20 min — velocità 6, pendenza 2%'))
  it('descrive un TABATA con pause, set ed esercizi',()=>{const result=text([],[tabata]);expect(result).toContain('3 set × [Jumping Jack, Skip, Climbers, Squat Jump]');expect(result).toContain('20″/10″');expect(result).toContain('pausa set 1′30″')})
})
