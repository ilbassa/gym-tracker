<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Share2 } from 'lucide-vue-next'
import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import WorkoutShareModal from '@/components/WorkoutShareModal.vue'
import CardioLogCard from '@/components/CardioLogCard.vue'
import WeightLogCard from '@/components/WeightLogCard.vue'
import { cardioLogRepository } from '@/repositories/cardioLogRepository'
import { weightLogRepository } from '@/repositories/weightLogRepository'
import { useUiStore } from '@/stores/ui'
import { formatItalianDate } from '@/utils/date'
import type { CardioLog, WeightLogWithSets } from '@/models'

const route=useRoute(),ui=useUiStore(),date=computed(()=>String(route.params.date))
const weights=ref<WeightLogWithSets[]>([]),cardio=ref<CardioLog[]>([]),loading=ref(true),shareOpen=ref(false),deletingWeight=ref<WeightLogWithSets>(),deletingCardio=ref<CardioLog>()
async function load(){loading.value=true;try{[weights.value,cardio.value]=await Promise.all([weightLogRepository.listByDate(date.value),cardioLogRepository.listByDate(date.value)])}catch{ui.notify('Non è stato possibile caricare la giornata.','error')}finally{loading.value=false}}
async function removeWeight(){if(!deletingWeight.value)return;try{await weightLogRepository.delete(deletingWeight.value.id);deletingWeight.value=undefined;await load();ui.notify('Registrazione eliminata.','success')}catch{ui.notify('Eliminazione non riuscita.','error')}}
async function removeCardio(){if(!deletingCardio.value)return;try{await cardioLogRepository.delete(deletingCardio.value.id);deletingCardio.value=undefined;await load();ui.notify('Registrazione eliminata.','success')}catch{ui.notify('Eliminazione non riuscita.','error')}}
onMounted(load)
</script>
<template><div class="page"><AppPageHeader title="Allenamento" :subtitle="formatItalianDate(date,{weekday:'long',day:'numeric',month:'long',year:'numeric'})" back back-to="/dashboard/storico"><template #actions><AppButton variant="ghost" :icon="Share2" :disabled="!weights.length&&!cardio.length" @click="shareOpen=true">Condividi</AppButton></template></AppPageHeader><p v-if="loading" class="muted" role="status">Caricamento…</p><AppEmptyState v-else-if="!weights.length&&!cardio.length" title="Giornata vuota" description="Non risultano allenamenti in questa data."/><section v-else class="logs"><WeightLogCard v-for="log in weights" :key="log.id" :log="log" @delete="deletingWeight=$event"/><CardioLogCard v-for="log in cardio" :key="log.id" :log="log" @delete="deletingCardio=$event"/></section><WorkoutShareModal :open="shareOpen" :date="date" @close="shareOpen=false"/><AppConfirmDialog :open="Boolean(deletingWeight)" title="Eliminare la registrazione?" message="Verranno eliminate tutte le serie. L’esercizio resterà disponibile." confirm-label="Elimina" danger @close="deletingWeight=undefined" @confirm="removeWeight"/><AppConfirmDialog :open="Boolean(deletingCardio)" title="Eliminare la registrazione?" message="La registrazione cardio verrà eliminata. L’esercizio resterà disponibile." confirm-label="Elimina" danger @close="deletingCardio=undefined" @confirm="removeCardio"/></div></template>
<style scoped>.logs{display:grid;gap:var(--space-3)}</style>
