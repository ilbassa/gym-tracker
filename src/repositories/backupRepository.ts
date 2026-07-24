import { db as defaultDb, type GymTrackerDatabase } from '@/db/database'
import { muscleGroups, type CardioLog, type Exercise, type Settings, type WeightLog, type WeightSet } from '@/models'
import { defaultSettings } from '@/repositories/settingsRepository'

export const BACKUP_VERSION=1
export interface BackupData { version:number; exportedAt:string; exercises:Exercise[]; weightLogs:WeightLog[]; weightSets:WeightSet[]; cardioLogs:CardioLog[]; settings:Settings }
export interface BackupSummary { exercises:number; weightLogs:number; weightSets:number; cardioLogs:number }

function isObject(value:unknown):value is Record<string,unknown>{return typeof value==='object'&&value!==null&&!Array.isArray(value)}
export function validateBackup(value:unknown):value is BackupData{
  if(!isObject(value)||value.version!==BACKUP_VERSION||typeof value.exportedAt!=='string')return false
  if(!Array.isArray(value.exercises)||!Array.isArray(value.weightLogs)||!Array.isArray(value.weightSets)||!Array.isArray(value.cardioLogs)||!isObject(value.settings))return false
  const validExercise=value.exercises.every(x=>isObject(x)&&typeof x.id==='string'&&typeof x.name==='string'&&(x.type==='weights'||x.type==='cardio')&&(x.primaryMuscleGroup===undefined||muscleGroups.some(group=>group===x.primaryMuscleGroup)))
  const validWeight=value.weightLogs.every(x=>isObject(x)&&typeof x.id==='string'&&typeof x.exerciseId==='string'&&typeof x.date==='string')
  const validSets=value.weightSets.every(x=>isObject(x)&&typeof x.id==='string'&&typeof x.weightLogId==='string'&&typeof x.weight==='number'&&typeof x.repetitions==='number')
  const validCardio=value.cardioLogs.every(x=>{if(!isObject(x)||typeof x.id!=='string'||typeof x.exerciseId!=='string'||typeof x.minutes!=='number')return false;if(x.mode!==undefined&&x.mode!=='duration'&&x.mode!=='intervals')return false;if(x.mode==='intervals'){if(!isObject(x.interval)||typeof x.interval.workSeconds!=='number'||typeof x.interval.restSeconds!=='number'||typeof x.interval.sets!=='number'||typeof x.interval.restBetweenSetsSeconds!=='number'||!Array.isArray(x.interval.exercises)||!x.interval.exercises.every(name=>typeof name==='string'))return false}return true})
  const s=value.settings
  const validDriveSync=s.googleDriveLastSyncAt===undefined||typeof s.googleDriveLastSyncAt==='string'
  return validExercise&&validWeight&&validSets&&validCardio&&(s.theme==='system'||s.theme==='light'||s.theme==='dark')&&(s.defaultWeightMode==='total'||s.defaultWeightMode==='per_side')&&(s.exportFormat==='full'||s.exportFormat==='compact')&&typeof s.showExportDate==='boolean'&&validDriveSync
}
export function summarizeBackup(data:BackupData):BackupSummary{return{exercises:data.exercises.length,weightLogs:data.weightLogs.length,weightSets:data.weightSets.length,cardioLogs:data.cardioLogs.length}}

export class BackupRepository{
  constructor(private readonly database:GymTrackerDatabase=defaultDb){}
  async export():Promise<BackupData>{const[exercises,weightLogs,weightSets,cardioLogs,settingsRecord]=await Promise.all([this.database.exercises.toArray(),this.database.weightLogs.toArray(),this.database.weightSets.toArray(),this.database.cardioLogs.toArray(),this.database.settings.get('app')]);return{version:BACKUP_VERSION,exportedAt:new Date().toISOString(),exercises,weightLogs,weightSets,cardioLogs,settings:settingsRecord?.value??{...defaultSettings}}}
  async restore(data:BackupData):Promise<void>{if(!validateBackup(data))throw new Error('Il file di backup non è valido o usa una versione non supportata.');await this.database.transaction('rw',[this.database.exercises,this.database.weightLogs,this.database.weightSets,this.database.cardioLogs,this.database.circuitExercises,this.database.settings],async()=>{await Promise.all([this.database.exercises.clear(),this.database.weightLogs.clear(),this.database.weightSets.clear(),this.database.cardioLogs.clear(),this.database.circuitExercises.clear(),this.database.settings.clear()]);if(data.exercises.length)await this.database.exercises.bulkAdd(data.exercises);if(data.weightLogs.length)await this.database.weightLogs.bulkAdd(data.weightLogs);if(data.weightSets.length)await this.database.weightSets.bulkAdd(data.weightSets);if(data.cardioLogs.length)await this.database.cardioLogs.bulkAdd(data.cardioLogs);await this.database.settings.put({key:'app',value:data.settings})})}
  async clearAll():Promise<void>{await this.database.transaction('rw',[this.database.exercises,this.database.weightLogs,this.database.weightSets,this.database.cardioLogs,this.database.circuitExercises,this.database.settings],async()=>Promise.all([this.database.exercises.clear(),this.database.weightLogs.clear(),this.database.weightSets.clear(),this.database.cardioLogs.clear(),this.database.circuitExercises.clear(),this.database.settings.clear()]).then(()=>undefined))}
}
export const backupRepository=new BackupRepository()
