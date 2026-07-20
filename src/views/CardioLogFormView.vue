<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CircuitExerciseTextarea from '@/components/CircuitExerciseTextarea.vue'
import ExerciseAutocomplete from '@/components/ExerciseAutocomplete.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import AppSegmentedControl from '@/components/ui/AppSegmentedControl.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import { cardioLogRepository } from '@/repositories/cardioLogRepository'
import { circuitExerciseRepository } from '@/repositories/circuitExerciseRepository'
import { exerciseRepository } from '@/repositories/exerciseRepository'
import { calculateIntervalTotalSeconds, formatSeconds, validateIntervalDetails } from '@/services/cardioIntervals'
import { useUiStore } from '@/stores/ui'
import { formatItalianDate, toDateKey } from '@/utils/date'
import { normalizeExerciseName } from '@/utils/exercise'
import { formatNumber, parseItalianDecimal } from '@/utils/number'
import type { CardioIntervalDetails, CardioLog, CardioMode, Exercise } from '@/models'

const route=useRoute(),router=useRouter(),ui=useUiStore(),editingId=computed(()=>typeof route.params.id==='string'?route.params.id:undefined)
const exercises=ref<Exercise[]>([]),allExercises=ref<Exercise[]>([]),rememberedCircuitExercises=ref<string[]>([]),latest=ref<CardioLog>(),previousIntervalLogs=ref<CardioLog[]>([]),loading=ref(true),saving=ref(false)
const date=ref(toDateKey()),exerciseName=ref(''),minutes=ref('20'),notes=ref(''),mode=ref<CardioMode>('duration')
const workSeconds=ref('20'),restSeconds=ref('10'),setCount=ref('3'),restBetweenSets=ref('90'),circuitExercises=ref(''),selectedCircuitId=ref('')
const exerciseError=ref(''),minutesError=ref(''),workError=ref(''),restError=ref(''),setsError=ref(''),setRestError=ref(''),circuitError=ref(''),formError=ref('')
const selectedExercise=computed(()=>exercises.value.find(exercise=>exercise.normalizedName===normalizeExerciseName(exerciseName.value)))
const exerciseList=computed(()=>circuitExercises.value.split(/\r?\n|,/).map(name=>name.trim()).filter(Boolean))
const intervalDetails=computed<CardioIntervalDetails>(()=>({workSeconds:parseItalianDecimal(workSeconds.value),restSeconds:parseItalianDecimal(restSeconds.value),sets:parseItalianDecimal(setCount.value),restBetweenSetsSeconds:parseItalianDecimal(restBetweenSets.value),exercises:exerciseList.value}))
const intervalTotal=computed(()=>calculateIntervalTotalSeconds(intervalDetails.value))
const historicalCircuitExercises=computed(()=>{
  const seen=new Set<string>()
  const currentExercise=normalizeExerciseName(exerciseName.value)
  return [...rememberedCircuitExercises.value,...previousIntervalLogs.value.flatMap(log=>log.interval?.exercises??[]),...allExercises.value.filter(exercise=>exercise.active).map(exercise=>exercise.name)].filter(name=>{const normalized=normalizeExerciseName(name);if(!normalized||normalized===currentExercise||seen.has(normalized))return false;seen.add(normalized);return true})
})
const circuitOptions=computed(()=>{
  const seen=new Set<string>()
  const options=[{value:'',label:'Scegli un circuito salvato…'}]
  for(const log of previousIntervalLogs.value){
    if(!log.interval||log.id===editingId.value)continue
    const signature=JSON.stringify([log.interval.workSeconds,log.interval.restSeconds,log.interval.sets,log.interval.restBetweenSetsSeconds,log.interval.exercises.map(name=>normalizeExerciseName(name))])
    if(seen.has(signature))continue
    seen.add(signature)
    options.push({value:log.id,label:`${log.exerciseName} · ${log.interval.exercises.join(', ')} · ${log.interval.sets} set`})
    if(options.length===11)break
  }
  return options
})
let latestRequest=0

onMounted(async()=>{try{[allExercises.value,previousIntervalLogs.value]=await Promise.all([exerciseRepository.list(),cardioLogRepository.listBetween()]);exercises.value=allExercises.value.filter(exercise=>exercise.type==='cardio');await circuitExerciseRepository.remember(previousIntervalLogs.value.flatMap(log=>log.interval?.exercises??[]));rememberedCircuitExercises.value=(await circuitExerciseRepository.list()).map(item=>item.name);if(editingId.value){const log=await cardioLogRepository.get(editingId.value);if(!log){ui.notify('Registrazione non trovata.','error');await router.replace('/dashboard/oggi');return}date.value=log.date;exerciseName.value=log.exerciseName;minutes.value=String(log.minutes);notes.value=log.notes;mode.value=log.mode??'duration';if(log.interval){workSeconds.value=String(log.interval.workSeconds);restSeconds.value=String(log.interval.restSeconds);setCount.value=String(log.interval.sets);restBetweenSets.value=String(log.interval.restBetweenSetsSeconds);circuitExercises.value=log.interval.exercises.join('\n')}}}catch{formError.value='Non è stato possibile caricare il modulo.'}finally{loading.value=false}})
watch([selectedExercise,date],async([exercise])=>{const request=++latestRequest;if(!exercise){latest.value=undefined;return}const result=await cardioLogRepository.getLatestForExercise(exercise.id,date.value,editingId.value);if(request===latestRequest)latest.value=result})

function reuseCircuit(id:string){selectedCircuitId.value=id;if(!id)return;const log=previousIntervalLogs.value.find(item=>item.id===id);if(!log?.interval)return;exerciseName.value=log.exerciseName;workSeconds.value=String(log.interval.workSeconds);restSeconds.value=String(log.interval.restSeconds);setCount.value=String(log.interval.sets);restBetweenSets.value=String(log.interval.restBetweenSetsSeconds);circuitExercises.value=log.interval.exercises.join('\n')}

function resetErrors(){exerciseError.value='';minutesError.value='';workError.value='';restError.value='';setsError.value='';setRestError.value='';circuitError.value='';formError.value=''}
async function submit(){resetErrors();if(!exerciseName.value.trim())exerciseError.value='Scegli o inserisci un esercizio.';let parsedMinutes=parseItalianDecimal(minutes.value);let interval:CardioIntervalDetails|undefined
  if(mode.value==='duration'){if(!Number.isInteger(parsedMinutes)||parsedMinutes<=0)minutesError.value='Inserisci minuti interi maggiori di zero.'}
  else{interval=intervalDetails.value;const errors=validateIntervalDetails(interval);if(!Number.isInteger(interval.workSeconds)||interval.workSeconds<=0)workError.value='Inserisci secondi interi maggiori di zero.';if(!Number.isInteger(interval.restSeconds)||interval.restSeconds<0)restError.value='Inserisci secondi interi maggiori o uguali a zero.';if(!Number.isInteger(interval.sets)||interval.sets<=0)setsError.value='Inserisci un numero intero maggiore di zero.';if(!Number.isInteger(interval.restBetweenSetsSeconds)||interval.restBetweenSetsSeconds<0)setRestError.value='Inserisci secondi interi maggiori o uguali a zero.';if(!interval.exercises.length)circuitError.value='Inserisci almeno un esercizio, uno per riga.';if(errors.length)formError.value='Controlla i dettagli dell’allenamento a intervalli.';parsedMinutes=Number((intervalTotal.value/60).toFixed(2))}
  if(exerciseError.value||minutesError.value||formError.value)return;saving.value=true;try{const exercise=await exerciseRepository.findOrCreate(exerciseName.value,'cardio');await cardioLogRepository.save({id:editingId.value,exerciseId:exercise.id,exerciseName:exercise.name,date:date.value,minutes:parsedMinutes,mode:mode.value,interval,notes:notes.value});if(interval)await circuitExerciseRepository.remember(interval.exercises);ui.notify(editingId.value?'Registrazione aggiornata.':'Cardio salvato.','success');await router.push('/dashboard/oggi')}catch(caught){formError.value=caught instanceof Error?caught.message:'Non è stato possibile salvare la registrazione.'}finally{saving.value=false}}
</script>
<template><div class="page"><AppPageHeader :title="editingId?'Modifica cardio':'Nuovo cardio'" back/><p v-if="loading" class="muted" role="status">Caricamento…</p><form v-else class="stack" novalidate @submit.prevent="submit"><AppInput v-model="date" label="Data" type="date" required/><ExerciseAutocomplete v-model="exerciseName" :exercises="exercises" label="Esercizio cardio" :error="exerciseError"/><AppCard v-if="latest" class="latest"><p class="eyebrow">Ultima volta: {{formatItalianDate(latest.date,{day:'2-digit',month:'2-digit',year:'numeric'})}}</p><p v-if="(latest.mode??'duration')==='intervals'&&latest.interval"><strong>{{latest.interval.sets}} set</strong> · {{formatSeconds(latest.interval.workSeconds)}} / {{formatSeconds(latest.interval.restSeconds)}}</p><p v-else><strong>{{formatNumber(latest.minutes)}}</strong> min</p></AppCard><AppSegmentedControl v-model="mode" label="Tipo di attività cardio" :options="[{value:'duration',label:'Durata'},{value:'intervals',label:'Intervalli / TABATA'}]"/><AppInput v-if="mode==='duration'" v-model="minutes" label="Minuti" inputmode="numeric" :error="minutesError" required/><template v-else><AppCard><section class="interval-section"><div><p class="eyebrow">Struttura circuito</p><h2>Intervalli</h2></div><div v-if="circuitOptions.length>1" class="reuse"><AppSelect :model-value="selectedCircuitId" label="Riusa un circuito precedente" :options="circuitOptions" @update:model-value="reuseCircuit"/><p class="field-hint">Recupera esercizi, tempi, pause e numero di set; puoi poi modificarli liberamente.</p></div><div class="interval-grid"><AppInput v-model="workSeconds" label="Lavoro (sec)" inputmode="numeric" :error="workError" required/><AppInput v-model="restSeconds" label="Pausa esercizi (sec)" inputmode="numeric" :error="restError" required/><AppInput v-model="setCount" label="Numero set" inputmode="numeric" :error="setsError" hint="Esempio: 3 giri" required/><AppInput v-model="restBetweenSets" label="Pausa tra set (sec)" inputmode="numeric" :error="setRestError" hint="90 = 1′30″" required/></div><CircuitExerciseTextarea v-model="circuitExercises" label="Esercizi del set, uno per riga" :suggestions="historicalCircuitExercises" :rows="5" :error="circuitError"/><p v-if="intervalTotal" class="total">Durata stimata: <strong>{{formatSeconds(intervalTotal)}}</strong> ({{formatNumber(intervalTotal/60)}} min)</p></section></AppCard></template><AppTextarea v-model="notes" label="Note (facoltative)" hint="Esempio: velocità 6, pendenza 2%."/><p v-if="formError" class="form-error" role="alert">{{formError}}</p><AppButton type="submit" block :disabled="saving">{{saving?'Salvataggio…':editingId?'Salva modifiche':'Salva cardio'}}</AppButton></form></div></template>
<style scoped>.latest p{margin:0}.latest p+p{margin-top:var(--space-2)}.latest strong{font-size:var(--text-xl)}.interval-section{display:grid;gap:var(--space-4)}.interval-section h2{margin:0;font-size:var(--text-lg)}.reuse{display:grid;gap:var(--space-1);padding-bottom:var(--space-3);border-bottom:1px solid var(--color-border)}.field-hint{margin:0;color:var(--color-text-muted);font-size:var(--text-xs)}.interval-grid{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}.total{margin:0;padding:var(--space-3);border-radius:var(--radius-sm);background:var(--color-primary-soft);color:var(--color-accent-text)}.form-error{margin:0;color:var(--color-danger);font-size:var(--text-sm)}@media(max-width:390px){.interval-grid{grid-template-columns:1fr}}</style>
