<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { CloudDownload, CloudUpload, Download, FileUp, Trash2 } from 'lucide-vue-next'
import AppButton from '@/components/ui/AppButton.vue'
import AppCard from '@/components/ui/AppCard.vue'
import AppInput from '@/components/ui/AppInput.vue'
import AppModal from '@/components/ui/AppModal.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import { backupRepository, summarizeBackup, validateBackup, type BackupData, type BackupSummary } from '@/repositories/backupRepository'
import { settingsRepository } from '@/repositories/settingsRepository'
import { GoogleDriveBackupError, googleDriveBackupService } from '@/services/googleDriveBackup'
import { useSettingsStore } from '@/stores/settings'
import { useUiStore } from '@/stores/ui'
import { toDateKey } from '@/utils/date'

type BackupSource = 'file' | 'drive'

const ui = useUiStore()
const settings = useSettingsStore()
const fileInput = ref<HTMLInputElement>()
const pending = ref<BackupData>()
const pendingSource = ref<BackupSource>('file')
const summary = ref<BackupSummary>()
const clearOpen = ref(false)
const clearPhrase = ref('')
const busy = ref(false)
const lastDriveSyncAt = ref<string>()
const driveConfigured = googleDriveBackupService.configured
const formattedLastSync = computed(() => lastDriveSyncAt.value
  ? new Intl.DateTimeFormat('it-IT', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(lastDriveSyncAt.value))
  : 'Mai')

onMounted(async () => {
  try {
    const values = await settingsRepository.get()
    lastDriveSyncAt.value = values.googleDriveLastSyncAt
    void googleDriveBackupService.prepare().catch(() => undefined)
  } catch {
    ui.notify('Impostazioni non disponibili.', 'error')
  }
})

function driveErrorMessage(error: unknown): string {
  if (error instanceof GoogleDriveBackupError) {
    if (error.code === 'no_backup') return error.message
    if (error.code === 'not_configured') return 'Configura il Client ID Google per abilitare Drive.'
    if (error.code === 'authorization_failed') return 'Accesso a Google Drive annullato o non riuscito.'
  }
  return 'Operazione Google Drive non riuscita.'
}

async function recordDriveSync(): Promise<void> {
  const syncedAt = new Date().toISOString()
  const values = await settingsRepository.get()
  await settingsRepository.save({ ...values, googleDriveLastSyncAt: syncedAt })
  lastDriveSyncAt.value = syncedAt
}

async function syncToDrive() {
  busy.value = true
  try {
    await googleDriveBackupService.upload(await backupRepository.export())
    await recordDriveSync()
    ui.notify('Backup sincronizzato con Google Drive.', 'success')
  } catch (error) {
    ui.notify(driveErrorMessage(error), 'error')
  } finally {
    busy.value = false
  }
}

async function loadFromDrive() {
  busy.value = true
  try {
    const parsed = await googleDriveBackupService.download()
    if (!validateBackup(parsed)) throw new Error('Backup Drive non valido.')
    pending.value = parsed
    pendingSource.value = 'drive'
    summary.value = summarizeBackup(parsed)
  } catch (error) {
    ui.notify(driveErrorMessage(error), 'error')
  } finally {
    busy.value = false
  }
}

async function exportBackup() {
  busy.value = true
  try {
    const data = await backupRepository.export()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `gym-tracker-backup-${toDateKey()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
    ui.notify('Backup esportato.', 'success')
  } catch {
    ui.notify('Esportazione non riuscita.', 'error')
  } finally {
    busy.value = false
  }
}

async function selectFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const parsed: unknown = JSON.parse(await file.text())
    if (!validateBackup(parsed)) throw new Error()
    pending.value = parsed
    pendingSource.value = 'file'
    summary.value = summarizeBackup(parsed)
  } catch {
    ui.notify('File non valido o versione non supportata.', 'error')
  } finally {
    (event.target as HTMLInputElement).value = ''
  }
}

async function restore() {
  if (!pending.value) return
  busy.value = true
  try {
    const source = pendingSource.value
    await backupRepository.restore(pending.value)
    if (source === 'drive') await recordDriveSync()
    await settings.initialize(true)
    pending.value = undefined
    summary.value = undefined
    ui.notify(source === 'drive' ? 'Backup Drive ripristinato.' : 'Backup ripristinato.', 'success')
  } catch {
    ui.notify('Ripristino fallito: i dati precedenti sono rimasti invariati.', 'error')
  } finally {
    busy.value = false
  }
}

async function clearAll() {
  if (clearPhrase.value !== 'CANCELLA') return
  busy.value = true
  try {
    await backupRepository.clearAll()
    await settings.initialize(true)
    lastDriveSyncAt.value = undefined
    clearOpen.value = false
    clearPhrase.value = ''
    ui.notify('Tutti i dati sono stati cancellati.', 'success')
  } catch {
    ui.notify('Cancellazione non riuscita.', 'error')
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="page">
    <AppPageHeader title="Dati" back />

    <AppCard>
      <section class="data-section">
        <div>
          <h2>Google Drive</h2>
          <p>Salva manualmente un backup privato nel tuo account Google Drive. Il ripristino sostituisce i dati presenti su questo dispositivo.</p>
        </div>
        <p class="sync-status"><strong>Ultima sincronizzazione:</strong> {{ formattedLastSync }}</p>
        <p v-if="!driveConfigured" class="configuration-note">Google Drive non è ancora configurato per questa installazione.</p>
        <div class="actions">
          <AppButton :icon="CloudUpload" :disabled="busy || !driveConfigured" @click="syncToDrive">
            {{ busy ? 'Operazione in corso…' : 'Sincronizza ora' }}
          </AppButton>
          <AppButton variant="secondary" :icon="CloudDownload" :disabled="busy || !driveConfigured" @click="loadFromDrive">
            Ripristina da Drive
          </AppButton>
        </div>
      </section>
    </AppCard>

    <AppCard>
      <section class="data-section">
        <div>
          <h2>File JSON</h2>
          <p>Esporta una copia completa dei tuoi dati o ripristina un file precedente.</p>
        </div>
        <div class="actions">
          <AppButton :icon="Download" :disabled="busy" @click="exportBackup">Esporta JSON</AppButton>
          <AppButton variant="secondary" :icon="FileUp" :disabled="busy" @click="fileInput?.click()">Importa JSON</AppButton>
          <input ref="fileInput" class="sr-only" type="file" accept="application/json,.json" @change="selectFile">
        </div>
      </section>
    </AppCard>

    <AppCard>
      <section class="data-section danger-zone">
        <div>
          <h2>Cancella tutti i dati</h2>
          <p>Elimina definitivamente esercizi, allenamenti e impostazioni da questo dispositivo.</p>
        </div>
        <AppButton variant="danger" :icon="Trash2" @click="clearOpen=true">Cancella tutto</AppButton>
      </section>
    </AppCard>

    <AppModal :open="Boolean(pending)" :title="pendingSource === 'drive' ? 'Ripristina backup Drive' : 'Conferma importazione'" @close="pending=undefined">
      <div v-if="summary" class="summary">
        <p>Il backup sostituirà interamente i dati presenti.</p>
        <ul>
          <li>{{ summary.exercises }} esercizi</li>
          <li>{{ summary.weightLogs }} registrazioni pesi</li>
          <li>{{ summary.weightSets }} serie</li>
          <li>{{ summary.cardioLogs }} registrazioni cardio</li>
        </ul>
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="pending=undefined">Annulla</AppButton>
        <AppButton :disabled="busy" @click="restore">Sostituisci dati</AppButton>
      </template>
    </AppModal>

    <AppModal :open="clearOpen" title="Cancellazione definitiva" @close="clearOpen=false">
      <div class="stack">
        <p class="warning">Questa operazione non può essere annullata. Esporta prima un backup se vuoi conservare i dati.</p>
        <AppInput v-model="clearPhrase" label="Scrivi CANCELLA per confermare" autocomplete="off" />
      </div>
      <template #footer>
        <AppButton variant="ghost" @click="clearOpen=false">Annulla</AppButton>
        <AppButton variant="danger" :disabled="clearPhrase!=='CANCELLA'||busy" @click="clearAll">Cancella definitivamente</AppButton>
      </template>
    </AppModal>
  </div>
</template>

<style scoped>
.data-section{display:grid;gap:var(--space-4)}
.data-section h2{margin:0;font-size:var(--text-lg)}
.data-section p{margin:var(--space-2) 0 0;color:var(--color-text-muted);line-height:1.55}
.data-section .sync-status{margin:0;padding:var(--space-3);border-radius:var(--radius-sm);background:var(--color-surface-subtle);color:var(--color-text)}
.data-section .configuration-note{margin:0;color:var(--color-warning);font-weight:650}
.actions{display:flex;flex-wrap:wrap;gap:var(--space-3)}
.danger-zone{border-left:4px solid var(--color-danger);padding-left:var(--space-3)}
.summary p,.warning{margin:0;line-height:1.55}
.summary ul{display:grid;gap:var(--space-2);margin-bottom:0}
</style>
