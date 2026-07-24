<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { DatabaseZap, Pencil, Power, RotateCcw } from 'lucide-vue-next'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppIconButton from '@/components/ui/AppIconButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppSegmentedControl from '@/components/ui/AppSegmentedControl.vue'
import { DuplicateExerciseError, exerciseRepository } from '@/repositories/exerciseRepository'
import { loadDemoExercises } from '@/services/demoData'
import { useUiStore } from '@/stores/ui'
import { formatItalianDate } from '@/utils/date'
import { muscleGroups, type ExerciseType, type ExerciseWithLastUse, type MuscleGroup } from '@/models'

const ui = useUiStore()
const isDevelopment = import.meta.env.DEV
const exercises = ref<ExerciseWithLastUse[]>([])
const loading = ref(true)
const filter = ref<'all' | ExerciseType>('all')
const search = ref('')
const editing = ref<ExerciseWithLastUse | null>(null)
const editName = ref('')
const editType = ref<ExerciseType>('weights')
const editPrimaryMuscleGroup = ref<MuscleGroup | ''>('')
const error = ref('')
const confirmTypeChange = ref(false)
const muscleGroupOptions = [
  { value: '', label: 'Non specificato' },
  ...muscleGroups.map((group) => ({ value: group, label: group.charAt(0).toLocaleUpperCase('it-IT') + group.slice(1) }))
]

const visibleExercises = computed(() => {
  const query = search.value.trim().toLocaleLowerCase('it-IT')
  return exercises.value.filter((exercise) => (filter.value === 'all' || exercise.type === filter.value) && (!query || exercise.name.toLocaleLowerCase('it-IT').includes(query)))
})

async function load() {
  loading.value = true
  try { exercises.value = await exerciseRepository.listWithLastUse() }
  catch { ui.notify('Non è stato possibile leggere gli esercizi.', 'error') }
  finally { loading.value = false }
}

function startEdit(exercise: ExerciseWithLastUse) {
  editing.value = exercise
  editName.value = exercise.name
  editType.value = exercise.type
  editPrimaryMuscleGroup.value = exercise.primaryMuscleGroup ?? ''
  error.value = ''
}

function requestSave() {
  error.value = ''
  if (!editName.value.trim()) { error.value = 'Inserisci il nome dell’esercizio.'; return }
  if (editing.value?.type !== editType.value) { confirmTypeChange.value = true; return }
  void saveEdit()
}

async function saveEdit() {
  if (!editing.value) return
  try {
    await exerciseRepository.update(editing.value.id, {
      name: editName.value,
      type: editType.value,
      primaryMuscleGroup: editPrimaryMuscleGroup.value || undefined
    })
    confirmTypeChange.value = false
    editing.value = null
    await load()
    ui.notify('Esercizio aggiornato.', 'success')
  } catch (caught) {
    confirmTypeChange.value = false
    error.value = caught instanceof DuplicateExerciseError ? caught.message : 'Non è stato possibile aggiornare l’esercizio.'
  }
}

async function toggleActive(exercise: ExerciseWithLastUse) {
  try {
    await exerciseRepository.setActive(exercise.id, !exercise.active)
    await load()
    ui.notify(exercise.active ? 'Esercizio disattivato.' : 'Esercizio riattivato.', 'success')
  } catch { ui.notify('Non è stato possibile modificare lo stato.', 'error') }
}

async function seedDemo() {
  try {
    const count = await loadDemoExercises()
    await load()
    ui.notify(count ? `${count} esercizi demo aggiunti.` : 'Gli esercizi demo sono già presenti.', 'success')
  } catch { ui.notify('Non è stato possibile caricare i dati demo.', 'error') }
}

onMounted(load)
</script>

<template>
  <div class="page">
    <AppPageHeader title="Esercizi" back back-to="/dashboard/altro">
      <template v-if="isDevelopment" #actions><AppIconButton label="Carica esercizi demo" :icon="DatabaseZap" @click="seedDemo" /></template>
    </AppPageHeader>

    <div class="filters">
      <AppInput v-model="search" label="Cerca esercizio" type="search" inputmode="search" autocomplete="off" />
      <AppSegmentedControl v-model="filter" label="Tipo esercizio" :options="[{ value: 'all', label: 'Tutti' }, { value: 'weights', label: 'Pesi' }, { value: 'cardio', label: 'Cardio' }]" />
    </div>

    <p v-if="loading" class="muted" role="status">Caricamento esercizi…</p>
    <AppEmptyState v-else-if="!visibleExercises.length" title="Nessun esercizio trovato" description="Modifica la ricerca o carica gli esercizi demo in ambiente di sviluppo." />
    <div v-else class="exercise-list">
      <AppCard v-for="exercise in visibleExercises" :key="exercise.id">
        <div class="exercise-row" :class="{ 'exercise-row--inactive': !exercise.active }">
          <div>
            <div class="cluster"><h2>{{ exercise.name }}</h2><span class="badge">{{ exercise.type === 'weights' ? 'Pesi' : 'Cardio' }}</span><span v-if="!exercise.active" class="badge badge--muted">Disattivato</span></div>
            <p>{{ exercise.lastUsedAt ? `Ultimo utilizzo: ${formatItalianDate(exercise.lastUsedAt, { day: '2-digit', month: '2-digit', year: 'numeric' })}` : 'Mai utilizzato' }}</p>
          </div>
          <div class="exercise-row__actions">
            <AppIconButton label="Modifica esercizio" :icon="Pencil" @click="startEdit(exercise)" />
            <AppIconButton :label="exercise.active ? 'Disattiva esercizio' : 'Riattiva esercizio'" :icon="exercise.active ? Power : RotateCcw" @click="toggleActive(exercise)" />
          </div>
        </div>
      </AppCard>
    </div>

    <AppModal :open="Boolean(editing)" title="Modifica esercizio" @close="editing = null">
      <div class="stack">
        <AppInput v-model="editName" label="Nome esercizio" :error="error" required />
        <AppSegmentedControl v-model="editType" label="Tipo esercizio" :options="[{ value: 'weights', label: 'Pesi' }, { value: 'cardio', label: 'Cardio' }]" />
        <AppSelect v-model="editPrimaryMuscleGroup" label="Gruppo muscolare principale" :options="muscleGroupOptions" />
        <p class="muted help">Il cambio di tipo non modifica le registrazioni storiche.</p>
      </div>
      <template #footer><AppButton variant="ghost" @click="editing = null">Annulla</AppButton><AppButton @click="requestSave">Salva</AppButton></template>
    </AppModal>

    <AppConfirmDialog :open="confirmTypeChange" title="Cambiare tipo?" message="Le registrazioni storiche resteranno invariate. L’esercizio comparirà solo nei nuovi inserimenti del tipo scelto." confirm-label="Cambia tipo" @close="confirmTypeChange = false" @confirm="saveEdit" />
  </div>
</template>

<style scoped>
.filters,.exercise-list{display:grid;gap:var(--space-3)}
.exercise-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:var(--space-3)}
.exercise-row--inactive{opacity:.68}.exercise-row h2{margin:0;font-size:var(--text-md)}.exercise-row p{margin:var(--space-2) 0 0;color:var(--color-text-muted);font-size:var(--text-sm)}
.exercise-row__actions{display:flex}.badge{padding:3px 8px;color:var(--color-accent-text);border-radius:99px;background:var(--color-primary-soft);font-size:var(--text-xs);font-weight:700}.badge--muted{color:var(--color-text-muted);background:var(--color-surface-subtle)}.help{margin:0;font-size:var(--text-sm)}
</style>
