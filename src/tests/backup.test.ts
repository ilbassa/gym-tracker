import 'fake-indexeddb/auto'
import { afterEach,describe,expect,it } from 'vitest'
import { GymTrackerDatabase } from '@/db/database'
import { BackupRepository,validateBackup,type BackupData } from '@/repositories/backupRepository'
import { defaultSettings } from '@/repositories/settingsRepository'
const databases:GymTrackerDatabase[]=[]
const stamp='2026-07-20T10:00:00.000Z'
function backup():BackupData{return{version:1,exportedAt:stamp,exercises:[{id:'e',name:'Panca',normalizedName:'panca',type:'weights',active:true,createdAt:stamp,updatedAt:stamp}],weightLogs:[{id:'w',exerciseId:'e',exerciseName:'Panca',date:'2026-07-20',notes:'',createdAt:stamp,updatedAt:stamp}],weightSets:[{id:'s',weightLogId:'w',position:1,weight:60,weightMode:'total',repetitions:10,createdAt:stamp,updatedAt:stamp}],cardioLogs:[],settings:{...defaultSettings}}}
function setup(){const db=new GymTrackerDatabase(`backup-test-${crypto.randomUUID()}`);databases.push(db);return{db,repo:new BackupRepository(db)}}
afterEach(async()=>{await Promise.all(databases.splice(0).map(db=>db.delete()))})
describe('backup',()=>{
 it('valida versione e struttura minima',()=>{expect(validateBackup(backup())).toBe(true);expect(validateBackup({...backup(),version:2})).toBe(false);expect(validateBackup({version:1})).toBe(false)})
 it('importa sostituendo interamente i dati',async()=>{const{db,repo}=setup();await db.exercises.add({id:'old',name:'Vecchio',normalizedName:'vecchio',type:'weights',active:true,createdAt:stamp,updatedAt:stamp});await repo.restore(backup());expect(await db.exercises.toArray()).toHaveLength(1);expect(await db.exercises.get('e')).toBeDefined();expect(await db.weightSets.get('s')).toMatchObject({weight:60})})
 it('esporta tutte le collezioni e le impostazioni',async()=>{const{repo}=setup();await repo.restore(backup());const result=await repo.export();expect(result).toMatchObject({version:1,settings:defaultSettings});expect(result.exercises).toHaveLength(1);expect(result.weightLogs).toHaveLength(1);expect(result.weightSets).toHaveLength(1)})
})
