<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { CalendarDays, ChevronRight, RotateCcw } from 'lucide-vue-next'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppSegmentedControl from '@/components/ui/AppSegmentedControl.vue'
import { cardioLogRepository } from '@/repositories/cardioLogRepository'
import { exerciseRepository } from '@/repositories/exerciseRepository'
import { weightLogRepository } from '@/repositories/weightLogRepository'
import { buildHistoryDays } from '@/services/history'
import { useHistoryFiltersStore } from '@/stores/filters'
import { useUiStore } from '@/stores/ui'
import { formatItalianDate } from '@/utils/date'
import { formatNumber } from '@/utils/number'
import type { CardioLog, Exercise, WeightLogWithSets } from '@/models'

const ui = useUiStore(), filterStore = useHistoryFiltersStore()
const { from, to, type, exerciseId } = storeToRefs(filterStore)
const weights = ref<WeightLogWithSets[]>([]), cardio = ref<CardioLog[]>([]), exercises = ref<Exercise[]>([]), loading = ref(true)
const days = computed(() => buildHistoryDays(weights.value, cardio.value, { from: from.value || undefined, to: to.value || undefined, type: type.value, exerciseId: exerciseId.value || undefined }).map((day) => ({ ...day, cardioMinutes: day.cardioMinutes ? formatNumber(day.cardioMinutes) : '', cardioLogs: day.cardioLogs.map((log) => ({ ...log, minutes: formatNumber(log.minutes) })) })))
const exerciseOptions = computed(() => [{ value: '', label: 'Tutti gli esercizi' }, ...exercises.value.filter((item) => type.value === 'all' || item.type === type.value).map((item) => ({ value: item.id, label: item.name }))])
watch(type, () => { if (exerciseId.value && !exerciseOptions.value.some((option) => option.value === exerciseId.value)) exerciseId.value = '' })

onMounted(async () => {
  try { [weights.value, cardio.value, exercises.value] = await Promise.all([weightLogRepository.listBetween(), cardioLogRepository.listBetween(), exerciseRepository.list()]) }
  catch { ui.notify('Non è stato possibile caricare lo storico.', 'error') }
  finally { loading.value = false }
})
</script>
<template><div class="page"><AppPageHeader title="Storico" subtitle="Allenamenti raggruppati per giornata"/><AppCard><div class="filters"><div class="date-grid"><AppInput v-model="from" label="Dal" type="date"/><AppInput v-model="to" label="Al" type="date"/></div><AppSegmentedControl v-model="type" label="Tipo registrazione" :options="[{value:'all',label:'Tutti'},{value:'weights',label:'Pesi'},{value:'cardio',label:'Cardio'}]"/><AppSelect v-model="exerciseId" label="Esercizio" :options="exerciseOptions"/><AppButton v-if="from||to||type!=='all'||exerciseId" variant="ghost" :icon="RotateCcw" @click="filterStore.reset">Azzera filtri</AppButton></div></AppCard><p v-if="loading" class="muted" role="status">Caricamento storico…</p><AppEmptyState v-else-if="!days.length" title="Nessun allenamento trovato" description="Non ci sono registrazioni che corrispondono ai filtri selezionati."><template #icon><CalendarDays :size="32" aria-hidden="true"/></template></AppEmptyState><section v-else class="history-list" aria-label="Giornate di allenamento"><AppCard v-for="day in days" :key="day.date"><RouterLink class="day" :to="`/dashboard/storico/${day.date}`"><div class="day__header"><div><p class="eyebrow">{{formatItalianDate(day.date,{weekday:'long'})}}</p><h2>{{formatItalianDate(day.date,{day:'2-digit',month:'long',year:'numeric'})}}</h2></div><ChevronRight :size="22" aria-hidden="true"/></div><div class="day__summary"><span v-if="day.weightExercises">{{day.weightExercises}} esercizi pesi</span><span v-if="day.totalSets">{{day.totalSets}} serie</span><span v-if="day.cardioMinutes">{{day.cardioMinutes}} min cardio</span></div><ul><li v-for="log in day.weightLogs" :key="log.id"><strong>{{log.exerciseName}}</strong><span>{{log.sets.length}} serie · {{formatNumber(log.sets.at(-1)?.weight??0)}} kg</span></li><li v-for="log in day.cardioLogs" :key="log.id"><strong>{{log.exerciseName}}</strong><span>{{log.minutes}} min</span></li></ul></RouterLink></AppCard></section></div></template>
<style scoped>.filters,.history-list{display:grid;gap:var(--space-3)}.date-grid{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}.day{display:block;text-decoration:none}.day__header{display:flex;align-items:center;justify-content:space-between}.day h2{margin:0;font-size:var(--text-lg);text-transform:capitalize}.day__summary{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-3)}.day__summary span{padding:4px 8px;border-radius:99px;background:var(--color-surface-subtle);color:var(--color-text-muted);font-size:var(--text-xs);font-weight:700}.day ul{display:grid;gap:var(--space-2);margin:var(--space-3) 0 0;padding:var(--space-3) 0 0;border-top:1px solid var(--color-border);list-style:none}.day li{display:flex;justify-content:space-between;gap:var(--space-3);font-size:var(--text-sm)}.day li span{color:var(--color-text-muted);text-align:right}</style>
