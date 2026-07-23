<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { Check, Clipboard, Share2 } from 'lucide-vue-next'
import AppButton from '@/components/ui/AppButton.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import { cardioLogRepository } from '@/repositories/cardioLogRepository'
import { settingsRepository } from '@/repositories/settingsRepository'
import { weightLogRepository } from '@/repositories/weightLogRepository'
import { generateWorkoutText } from '@/services/workoutText'
import { useUiStore } from '@/stores/ui'
import type { CardioLog, WeightLogWithSets } from '@/models'

const props = defineProps<{ open: boolean; date: string }>()
const emit = defineEmits<{ close: [] }>()
const ui = useUiStore(), text = ref(''), weights = ref<WeightLogWithSets[]>([]), cardio = ref<CardioLog[]>([]), showDate = ref(true), copied = ref(false), loading = ref(false)
const canShare = computed(() => typeof navigator !== 'undefined' && typeof navigator.share === 'function')

function regenerate(){text.value=generateWorkoutText({date:props.date,weightLogs:weights.value,cardioLogs:cardio.value,format:'compact',showDate:showDate.value})}
watch(()=>props.open,async(open)=>{if(!open)return;loading.value=true;copied.value=false;try{const [w,c,s]=await Promise.all([weightLogRepository.listByDate(props.date),cardioLogRepository.listByDate(props.date),settingsRepository.get()]);weights.value=w;cardio.value=c;showDate.value=s.showExportDate;regenerate()}catch{ui.notify('Non è stato possibile generare il testo.','error')}finally{loading.value=false}},{immediate:true})
async function copy(){try{await navigator.clipboard.writeText(text.value);copied.value=true;ui.notify('Testo copiato.','success');setTimeout(()=>copied.value=false,1800)}catch{ui.notify('Copia non disponibile. Seleziona il testo manualmente.','error')}}
async function share(){if(!canShare.value)return;try{await navigator.share({title:'Allenamento',text:text.value})}catch(error){if(error instanceof DOMException&&error.name==='AbortError')return;ui.notify('Condivisione non riuscita. Puoi copiare il testo.','error')}}
</script>
<template><AppModal :open="open" title="Condividi allenamento" @close="emit('close')"><div class="share-content"><p v-if="loading" class="muted" role="status">Generazione anteprima…</p><AppTextarea v-else v-model="text" label="Anteprima modificabile" :rows="9" hint="Le modifiche qui non cambiano i dati dell’allenamento."/></div><template #footer><AppButton variant="secondary" :icon="copied?Check:Clipboard" @click="copy">{{copied?'Copiato':'Copia testo'}}</AppButton><AppButton v-if="canShare" :icon="Share2" @click="share">Condividi</AppButton></template></AppModal></template>
<style scoped>.share-content{display:grid;gap:var(--space-4)}</style>
