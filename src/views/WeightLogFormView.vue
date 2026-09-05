<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Copy, Plus, Trash2 } from 'lucide-vue-next'
import ExerciseAutocomplete from '@/components/ExerciseAutocomplete.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppIconButton from '@/components/ui/AppIconButton.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import AppSelect from '@/components/ui/AppSelect.vue'
import AppTextarea from '@/components/ui/AppTextarea.vue'
import { exerciseRepository } from '@/repositories/exerciseRepository'
import { settingsRepository } from '@/repositories/settingsRepository'
import { weightLogRepository, type SaveWeightLogInput } from '@/repositories/weightLogRepository'
import { useUiStore } from '@/stores/ui'
import { formatItalianDate, toDateKey } from '@/utils/date'
import { normalizeExerciseName } from '@/utils/exercise'
import { createId } from '@/utils/id'
import { parseItalianDecimal } from '@/utils/number'
import { duplicateLastSet, validateWeightSets } from '@/utils/weightSets'
import { formatWeightSet } from '@/utils/weightDisplay'
import type { DurationUnit, Exercise, WeightLogWithSets, WeightMode, WeightSetDraft } from '@/models'

interface EditableSet { key: string; weight: string; weightMode: WeightMode; repetitions: string; timed: boolean; duration: string; durationUnit: DurationUnit }

const route = useRoute()
const router = useRouter()
const ui = useUiStore()
const editingId = computed(() => typeof route.params.id === 'string' ? route.params.id : undefined)
const exercises = ref<Exercise[]>([])
const date = ref(toDateKey())
const exerciseName = ref('')
const notes = ref('')
const sets = ref<EditableSet[]>([])
const latest = ref<WeightLogWithSets | undefined>()
const loading = ref(true)
const saving = ref(false)
const exerciseError = ref('')
const formError = ref('')
const setErrors = ref<Record<number, { weight?: string; repetitions?: string; duration?: string }>>({})
const conflict = ref<{ existing: WeightLogWithSets; input: SaveWeightLogInput } | null>(null)
let latestRequest = 0

const selectedExercise = computed(() => exercises.value.find((exercise) => exercise.normalizedName === normalizeExerciseName(exerciseName.value)))
const emptySet = (mode: WeightMode): EditableSet => ({ key: createId(), weight: '0', weightMode: mode, repetitions: '10', timed: false, duration: '', durationUnit: 'seconds' })

function editableSet(set: WeightSetDraft): EditableSet {
  const durationUnit = set.durationUnit ?? 'seconds'
  return { key: createId(), weight: String(set.weight), weightMode: set.weightMode,
    repetitions: set.durationSeconds === undefined ? String(set.repetitions) : '10',
    timed: set.durationSeconds !== undefined, durationUnit,
    duration: set.durationSeconds === undefined ? '' : String(set.durationSeconds / (durationUnit === 'minutes' ? 60 : 1)) }
}

function setTimed(set: EditableSet, timed: boolean) {
  set.timed = timed
  setErrors.value = {}
}

function changeDurationUnit(set: EditableSet, event: Event) {
  const unit = (event.target as HTMLSelectElement).value as DurationUnit
  const value = parseItalianDecimal(set.duration)
  if (set.duration.trim() && Number.isFinite(value) && unit !== set.durationUnit) {
    set.duration = String(Number((unit === 'minutes' ? value / 60 : value * 60).toFixed(10)))
  }
  set.durationUnit = unit
}

onMounted(async () => {
  try {
    const [availableExercises, settings] = await Promise.all([exerciseRepository.list({ type: 'weights' }), settingsRepository.get()])
    exercises.value = availableExercises
    sets.value = [emptySet(settings.defaultWeightMode)]
    if (editingId.value) {
      const log = await weightLogRepository.get(editingId.value)
      if (!log) { ui.notify('Registrazione non trovata.', 'error'); await router.replace('/dashboard/oggi'); return }
      date.value = log.date
      exerciseName.value = log.exerciseName
      notes.value = log.notes
      sets.value = log.sets.map(editableSet)
    }
  } catch { formError.value = 'Non è stato possibile caricare il modulo.' }
  finally { loading.value = false }
})

watch([selectedExercise, date], async ([exercise]) => {
  const request = ++latestRequest
  if (!exercise) { latest.value = undefined; return }
  const result = await weightLogRepository.getLatestForExercise(exercise.id, date.value, editingId.value)
  if (request === latestRequest) latest.value = result
})

function addSet() {
  const fallback = emptySet(sets.value.at(-1)?.weightMode ?? 'total')
  const next = duplicateLastSet(sets.value, fallback)
  next[next.length - 1] = { ...next[next.length - 1]!, key: createId() }
  sets.value = next
}

function removeSet(index: number) { sets.value.splice(index, 1); setErrors.value = {} }

function copyLatest() {
  if (!latest.value) return
  sets.value = latest.value.sets.map(editableSet)
  ui.notify('Ultima registrazione copiata.', 'success')
}

function parsedSets(): WeightSetDraft[] {
  return sets.value.map((set) => ({ weight: parseItalianDecimal(set.weight), weightMode: set.weightMode,
    repetitions: set.timed ? 0 : parseItalianDecimal(set.repetitions),
    ...(set.timed ? { durationSeconds: Number((parseItalianDecimal(set.duration) * (set.durationUnit === 'minutes' ? 60 : 1)).toFixed(8)), durationUnit: set.durationUnit } : {}) }))
}

async function submit() {
  exerciseError.value = ''
  formError.value = ''
  if (!exerciseName.value.trim()) { exerciseError.value = 'Scegli o inserisci un esercizio.'; return }
  if (!sets.value.length) { formError.value = 'Aggiungi almeno una serie.'; return }
  const drafts = parsedSets()
  setErrors.value = validateWeightSets(drafts)
  if (Object.keys(setErrors.value).length) return
  saving.value = true
  try {
    const exercise = await exerciseRepository.findOrCreate(exerciseName.value, 'weights')
    const input: SaveWeightLogInput = { id: editingId.value, exerciseId: exercise.id, exerciseName: exercise.name, date: date.value, notes: notes.value, sets: drafts }
    const existing = await weightLogRepository.findSameExerciseOnDate(date.value, exercise.id, editingId.value)
    if (existing) { conflict.value = { existing, input }; return }
    await weightLogRepository.save(input)
    ui.notify(editingId.value ? 'Registrazione aggiornata.' : 'Allenamento salvato.', 'success')
    await router.push('/dashboard/oggi')
  } catch (caught) {
    formError.value = caught instanceof Error ? caught.message : 'Non è stato possibile salvare la registrazione.'
  } finally { saving.value = false }
}

async function resolveConflict(action: 'append' | 'separate') {
  if (!conflict.value) return
  saving.value = true
  try {
    const { existing, input } = conflict.value
    if (action === 'append') {
      await weightLogRepository.appendSets(existing.id, input.sets)
      if (input.id) await weightLogRepository.delete(input.id)
    } else await weightLogRepository.save(input)
    conflict.value = null
    ui.notify(action === 'append' ? 'Serie aggiunte alla registrazione esistente.' : 'Registrazione separata salvata.', 'success')
    await router.push('/dashboard/oggi')
  } catch { formError.value = 'Non è stato possibile completare il salvataggio.' }
  finally { saving.value = false }
}
</script>

<template>
  <div class="page">
    <AppPageHeader :title="editingId ? 'Modifica pesi' : 'Nuova serie pesi'" back />
    <p v-if="loading" class="muted" role="status">Caricamento…</p>
    <form v-else class="stack" novalidate @submit.prevent="submit">
      <AppInput v-model="date" label="Data" type="date" required />
      <ExerciseAutocomplete v-model="exerciseName" :exercises="exercises" label="Esercizio pesi" :error="exerciseError" />

      <AppCard v-if="latest" class="latest-card">
        <div class="latest-card__header"><div><p class="eyebrow">Ultima volta</p><strong>{{ formatItalianDate(latest.date, { day: '2-digit', month: '2-digit', year: 'numeric' }) }}</strong></div><AppButton variant="secondary" :icon="Copy" @click="copyLatest">Copia</AppButton></div>
        <ol><li v-for="set in latest.sets" :key="set.id">{{ formatWeightSet(set, true) }}</li></ol>
      </AppCard>

      <AppTextarea v-model="notes" label="Note (facoltative)" />

      <section class="sets-section" aria-labelledby="sets-title">
        <div class="section-header"><div><p class="eyebrow">Dettagli allenamento</p><h2 id="sets-title">Serie</h2></div><AppButton variant="secondary" :icon="Plus" @click="addSet">Aggiungi serie</AppButton></div>
        <p v-if="!sets.length" class="field-error">Aggiungi almeno una serie.</p>
        <AppCard v-for="(set, index) in sets" :key="set.key" class="set-card" compact>
          <header>
            <strong>Serie {{ index + 1 }}</strong>
            <div class="set-mode" role="group" :aria-label="`Modalità serie ${index + 1}`">
              <button type="button" :aria-pressed="!set.timed" @click="setTimed(set, false)">Ripetizioni</button>
              <button type="button" :aria-pressed="set.timed" @click="setTimed(set, true)">A tempo</button>
            </div>
            <AppIconButton label="Elimina serie" :icon="Trash2" danger @click="removeSet(index)" />
          </header>
          <div class="set-grid">
            <AppInput v-model="set.weight" label="Peso kg" inputmode="decimal" :error="setErrors[index]?.weight" compact required />
            <AppInput v-if="!set.timed" v-model="set.repetitions" label="Ripetiz." inputmode="numeric" :error="setErrors[index]?.repetitions" compact required />
            <AppInput v-else v-model="set.duration" label="Durata" inputmode="decimal" :error="setErrors[index]?.duration" compact required>
              <template #suffix>
                <select class="duration-unit" :aria-label="`Unità durata serie ${index + 1}`" :value="set.durationUnit" @change="changeDurationUnit(set, $event)">
                  <option value="seconds">s</option><option value="minutes">min</option>
                </select>
              </template>
            </AppInput>
            <AppSelect v-model="set.weightMode" label="Carico" :options="[{ value: 'total', label: 'Totale' }, { value: 'per_side', label: 'Per parte' }]" compact />
          </div>
        </AppCard>
      </section>

      <p v-if="formError" class="form-error" role="alert">{{ formError }}</p>
      <AppButton type="submit" block :disabled="saving">{{ saving ? 'Salvataggio…' : editingId ? 'Salva modifiche' : 'Salva allenamento' }}</AppButton>
    </form>

    <AppModal :open="Boolean(conflict)" title="Registrazione già presente" @close="conflict = null">
      <p class="conflict-copy">Per questo esercizio esiste già una registrazione nella stessa data. Come vuoi procedere?</p>
      <template #footer><div class="conflict-actions"><AppButton variant="ghost" @click="conflict = null">Annulla</AppButton><AppButton variant="secondary" @click="resolveConflict('separate')">Crea separata</AppButton><AppButton @click="resolveConflict('append')">Aggiungi serie</AppButton></div></template>
    </AppModal>
  </div>
</template>

<style scoped>
.set-card header strong { white-space: nowrap; }
.set-mode { display: flex; padding: 3px; border-radius: var(--radius-sm); background: var(--color-surface-subtle); }
.set-mode button { min-height: 36px; padding: 0 var(--space-2); border: 0; border-radius: 6px; background: transparent; color: var(--color-text-muted); font-size: var(--text-xs); font-weight: 700; white-space: nowrap; cursor: pointer; }
.set-mode button[aria-pressed="true"] { background: var(--color-surface); color: var(--color-accent-text); box-shadow: var(--shadow-card); }
.duration-unit { width: 46px; height: 100%; padding-left: 3px; border: 0; border-left: 1px solid var(--color-border); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; background: transparent; color: var(--color-text); font-size: var(--text-xs); cursor: pointer; }
.latest-card__header,.section-header,.set-card header{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3)}.latest-card ol{display:grid;gap:var(--space-1);margin:var(--space-3) 0 0;padding-left:1.5rem;color:var(--color-text-muted)}.section-header h2{margin:0;font-size:var(--text-lg)}.sets-section{display:grid;gap:var(--space-2)}.set-card{display:grid;gap:var(--space-1)}.set-card header{min-height:36px}.set-card header{gap:var(--space-1)}.set-card header strong{font-size:var(--text-sm)}.set-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(100px,1fr) minmax(0,1.15fr);gap:var(--space-2);align-items:start}.field-error,.form-error{margin:0;color:var(--color-danger);font-size:var(--text-sm)}.conflict-copy{margin:0;line-height:1.55}.conflict-actions{display:flex;flex:1;flex-wrap:wrap;justify-content:flex-end;gap:var(--space-2)}@media(max-width:410px){.conflict-actions>*{width:100%}}
</style>
