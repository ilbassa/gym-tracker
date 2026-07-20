import { describe,expect,it } from 'vitest'
import { calculateIntervalTotalSeconds,formatSeconds,validateIntervalDetails } from '@/services/cardioIntervals'
const details={workSeconds:20,restSeconds:10,sets:3,restBetweenSetsSeconds:90,exercises:['Jumping Jack','Skip','Climbers','Squat Jump']}
describe('cardio a intervalli',()=>{
 it('calcola lavoro, pause tra esercizi e pause tra set',()=>expect(calculateIntervalTotalSeconds(details)).toBe(510))
 it('formatta secondi e minuti',()=>{expect(formatSeconds(20)).toBe('20″');expect(formatSeconds(90)).toBe('1′30″');expect(formatSeconds(120)).toBe('2′')})
 it('valida set, tempi ed elenco esercizi',()=>{expect(validateIntervalDetails(details)).toEqual([]);expect(validateIntervalDetails({...details,sets:0,exercises:[]})).toHaveLength(2)})
})
