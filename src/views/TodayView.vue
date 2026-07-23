<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Bike, CloudUpload, Dumbbell, Share2 } from 'lucide-vue-next'
import CardioLogCard from '@/components/CardioLogCard.vue'
import WorkoutShareModal from '@/components/WorkoutShareModal.vue'
import WeightLogCard from '@/components/WeightLogCard.vue'
import AppButton from '@/components/ui/AppButton.vue'
import AppConfirmDialog from '@/components/ui/AppConfirmDialog.vue'
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import { cardioLogRepository } from '@/repositories/cardioLogRepository'
import { settingsRepository } from '@/repositories/settingsRepository'
import { weightLogRepository } from '@/repositories/weightLogRepository'
import { recentWorkoutStart, shouldShowDriveBackupReminder } from '@/services/backupReminder'
import { useUiStore } from '@/stores/ui'
import { formatItalianDate, toDateKey } from '@/utils/date'
import type { CardioLog, WeightLogWithSets } from '@/models'

type DayItem = { type: 'weights'; data: WeightLogWithSets } | { type: 'cardio'; data: CardioLog }

const ui = useUiStore()
const today = toDateKey()
const weightLogs = ref<WeightLogWithSets[]>([])
const cardioLogs = ref<CardioLog[]>([])
const loading = ref(true)
const deleting = ref<WeightLogWithSets | null>(null)
const deletingCardio = ref<CardioLog | null>(null)
const shareOpen = ref(false)
const showBackupReminder = ref(false)
const items = computed<DayItem[]>(() => [
  ...weightLogs.value.map((data): DayItem => ({ type: 'weights', data })),
  ...cardioLogs.value.map((data): DayItem => ({ type: 'cardio', data }))
].sort((a, b) => a.data.createdAt.localeCompare(b.data.createdAt)))

async function load() {
  loading.value = true
  try { [weightLogs.value, cardioLogs.value] = await Promise.all([weightLogRepository.listByDate(today), cardioLogRepository.listByDate(today)]) }
  catch { ui.notify('Non è stato possibile caricare l’allenamento di oggi.', 'error') }
  finally { loading.value = false }
}

async function loadBackupReminder() {
  try {
    const from = recentWorkoutStart()
    const [settings, recentWeights, recentCardio] = await Promise.all([
      settingsRepository.get(),
      weightLogRepository.listBetween(from, today),
      cardioLogRepository.listBetween(from, today)
    ])
    showBackupReminder.value = shouldShowDriveBackupReminder(
      settings.googleDriveLastSyncAt,
      recentWeights.length > 0 || recentCardio.length > 0
    )
  } catch {
    showBackupReminder.value = false
  }
}

async function confirmDelete() {
  if (!deleting.value) return
  try { await weightLogRepository.delete(deleting.value.id); deleting.value = null; await load(); ui.notify('Registrazione eliminata.', 'success') }
  catch { ui.notify('Non è stato possibile eliminare la registrazione.', 'error') }
}

async function confirmDeleteCardio() {
  if (!deletingCardio.value) return
  try { await cardioLogRepository.delete(deletingCardio.value.id); deletingCardio.value = null; await load(); ui.notify('Registrazione eliminata.', 'success') }
  catch { ui.notify('Non è stato possibile eliminare la registrazione.', 'error') }
}

onMounted(() => {
  void load()
  void loadBackupReminder()
})
</script>

<template>
  <div class="page">
    <AppPageHeader title="Oggi" :subtitle="formatItalianDate(today)" />
    <aside v-if="showBackupReminder" class="backup-reminder" aria-label="Promemoria backup">
      <CloudUpload :size="24" aria-hidden="true" />
      <div>
        <strong>È il momento di un backup</strong>
        <p>Hai allenamenti recenti e non hai un backup Google Drive aggiornato negli ultimi 30 giorni.</p>
      </div>
      <AppButton variant="secondary" @click="$router.push('/dashboard/dati')">Vai ai dati</AppButton>
    </aside>
    <div class="quick-actions">
      <AppButton :icon="Dumbbell" block @click="$router.push('/dashboard/pesi/nuovo')">Nuova serie pesi</AppButton>
      <AppButton :icon="Bike" variant="secondary" block @click="$router.push('/dashboard/cardio/nuovo')">Nuova serie cardio</AppButton>
      <AppButton :icon="Share2" variant="ghost" block :disabled="!items.length" @click="shareOpen=true">Condividi allenamento</AppButton>
    </div>

    <p v-if="loading" class="muted" role="status">Caricamento allenamento…</p>
    <AppEmptyState v-else-if="!items.length" title="Nessun allenamento registrato" description="Aggiungi una serie pesi o un esercizio cardio per iniziare.">
      <AppButton :icon="Dumbbell" block @click="$router.push('/dashboard/pesi/nuovo')">Nuova serie pesi</AppButton>
      <AppButton :icon="Bike" variant="secondary" block @click="$router.push('/dashboard/cardio/nuovo')">Nuova serie cardio</AppButton>
    </AppEmptyState>
    <section v-else class="day-list" aria-label="Allenamento di oggi">
      <template v-for="item in items" :key="item.data.id">
        <WeightLogCard v-if="item.type === 'weights'" :log="item.data" @delete="deleting = $event" />
        <CardioLogCard v-else :log="item.data" @delete="deletingCardio = $event" />
      </template>
    </section>

    <AppConfirmDialog :open="Boolean(deleting)" title="Eliminare la registrazione?" :message="`Verranno eliminate tutte le serie di ${deleting?.exerciseName ?? 'questo esercizio'}. L’esercizio resterà disponibile.`" confirm-label="Elimina" danger @close="deleting = null" @confirm="confirmDelete" />
    <AppConfirmDialog :open="Boolean(deletingCardio)" title="Eliminare la registrazione?" :message="`Verrà eliminata la registrazione di ${deletingCardio?.exerciseName ?? 'questo esercizio'}. L’esercizio resterà disponibile.`" confirm-label="Elimina" danger @close="deletingCardio = null" @confirm="confirmDeleteCardio" />
    <WorkoutShareModal :open="shareOpen" :date="today" @close="shareOpen=false" />
  </div>
</template>

<style scoped>
.quick-actions,.day-list{display:grid;gap:var(--space-3)}
.backup-reminder{display:grid;grid-template-columns:auto 1fr;align-items:start;gap:var(--space-3);padding:var(--space-4);border:1px solid color-mix(in srgb,var(--color-primary) 55%,var(--color-border));border-radius:var(--radius-md);background:var(--color-primary-soft);color:var(--color-accent-text)}
.backup-reminder div{min-width:0}
.backup-reminder strong{display:block}
.backup-reminder p{margin:var(--space-1) 0 0;color:var(--color-text);font-size:var(--text-sm);line-height:1.5}
.backup-reminder .app-button{grid-column:1/-1}
@media(min-width:560px){.backup-reminder{grid-template-columns:auto 1fr auto;align-items:center}.backup-reminder .app-button{grid-column:auto}}
</style>
