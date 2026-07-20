import type { CardioLog, WeightLogWithSets, WeightMode } from '@/models'

export interface GeneralStats { trainingDays: number; weightLogs: number; totalSets: number; cardioMinutes: number; mostFrequentWeight?: string; mostFrequentCardio?: string; weeklyFrequency: number }
export interface WeightModeStats { mode: WeightMode; sessions: number; sets: number; lastDate: string; latestWeight: number; maxWeight: number; maxRepetitions: number }
export interface WeightExerciseStats { exerciseId: string; name: string; sessions: number; totalSets: number; lastDate: string; modes: WeightModeStats[] }
export interface CardioExerciseStats { exerciseId: string; name: string; sessions: number; totalMinutes: number; averageMinutes: number; maxMinutes: number; lastDate: string }
export interface ChartPoint { label: string; value: number }

function mostFrequent<T extends { exerciseName: string }>(items: T[]): string | undefined {
  const counts = new Map<string, number>(); for (const item of items) counts.set(item.exerciseName, (counts.get(item.exerciseName) ?? 0) + 1)
  return [...counts].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0],'it-IT'))[0]?.[0]
}
function daysBetween(from:string,to:string):number{return Math.max(1,Math.round((new Date(`${to}T12:00:00`).getTime()-new Date(`${from}T12:00:00`).getTime())/86400000)+1)}

export function calculateGeneralStats(weights:WeightLogWithSets[],cardio:CardioLog[],from?:string,to?:string):GeneralStats{
  const days=new Set([...weights.map(x=>x.date),...cardio.map(x=>x.date)])
  const dates=[...days].sort();const span=from&&to?daysBetween(from,to):dates.length?daysBetween(dates[0]!,dates.at(-1)!):7
  return{trainingDays:days.size,weightLogs:weights.length,totalSets:weights.reduce((s,l)=>s+l.sets.length,0),cardioMinutes:cardio.reduce((s,l)=>s+l.minutes,0),mostFrequentWeight:mostFrequent(weights),mostFrequentCardio:mostFrequent(cardio),weeklyFrequency:Number((days.size/(span/7)).toFixed(1))}
}

export function calculateWeightStats(logs:WeightLogWithSets[]):WeightExerciseStats[]{
  const ids=[...new Set(logs.map(l=>l.exerciseId))]
  return ids.map(exerciseId=>{const exerciseLogs=logs.filter(l=>l.exerciseId===exerciseId).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));const modes:WeightModeStats[]=(['total','per_side'] as WeightMode[]).flatMap(mode=>{const modeLogs=exerciseLogs.map(log=>({log,sets:log.sets.filter(s=>s.weightMode===mode)})).filter(x=>x.sets.length);if(!modeLogs.length)return[];const all=modeLogs.flatMap(x=>x.sets);return[{mode,sessions:modeLogs.length,sets:all.length,lastDate:modeLogs[0]!.log.date,latestWeight:modeLogs[0]!.sets.at(-1)!.weight,maxWeight:Math.max(...all.map(s=>s.weight)),maxRepetitions:Math.max(...all.map(s=>s.repetitions))}]});return{exerciseId,name:exerciseLogs[0]!.exerciseName,sessions:exerciseLogs.length,totalSets:exerciseLogs.reduce((s,l)=>s+l.sets.length,0),lastDate:exerciseLogs[0]!.date,modes}}).sort((a,b)=>b.sessions-a.sessions||a.name.localeCompare(b.name,'it-IT'))
}

export function calculateCardioStats(logs:CardioLog[]):CardioExerciseStats[]{
  const ids=[...new Set(logs.map(l=>l.exerciseId))]
  return ids.map(exerciseId=>{const entries=logs.filter(l=>l.exerciseId===exerciseId).sort((a,b)=>b.date.localeCompare(a.date)||b.createdAt.localeCompare(a.createdAt));const total=entries.reduce((s,l)=>s+l.minutes,0);return{exerciseId,name:entries[0]!.exerciseName,sessions:entries.length,totalMinutes:total,averageMinutes:Number((total/entries.length).toFixed(1)),maxMinutes:Math.max(...entries.map(l=>l.minutes)),lastDate:entries[0]!.date}}).sort((a,b)=>b.sessions-a.sessions||a.name.localeCompare(b.name,'it-IT'))
}

function mondayKey(date:string):string{const d=new Date(`${date}T12:00:00`),day=(d.getDay()+6)%7;d.setDate(d.getDate()-day);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
export function weeklyTrainingPoints(weights:WeightLogWithSets[],cardio:CardioLog[]):ChartPoint[]{const days=[...new Set([...weights.map(x=>x.date),...cardio.map(x=>x.date)])];const counts=new Map<string,number>();for(const day of days){const key=mondayKey(day);counts.set(key,(counts.get(key)??0)+1)}return[...counts].sort().map(([label,value])=>({label,value}))}
export function weightProgressPoints(logs:WeightLogWithSets[],exerciseId:string,mode:WeightMode):ChartPoint[]{return logs.filter(l=>l.exerciseId===exerciseId&&l.sets.some(s=>s.weightMode===mode)).sort((a,b)=>a.date.localeCompare(b.date)).map(log=>({label:log.date,value:Math.max(...log.sets.filter(s=>s.weightMode===mode).map(s=>s.weight))}))}
export function cardioProgressPoints(logs:CardioLog[],exerciseId:string):ChartPoint[]{return logs.filter(l=>l.exerciseId===exerciseId).sort((a,b)=>a.date.localeCompare(b.date)).map(log=>({label:log.date,value:log.minutes}))}
