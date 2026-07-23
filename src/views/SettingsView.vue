<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { Monitor, Moon, Sun } from 'lucide-vue-next'
import AppCard from '@/components/ui/AppCard.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'
import AppSegmentedControl from '@/components/ui/AppSegmentedControl.vue'
import { settingsRepository } from '@/repositories/settingsRepository'
import { useSettingsStore } from '@/stores/settings'
import { useUiStore } from '@/stores/ui'
import type { Settings, WeightMode } from '@/models'
import type { ThemePreference } from '@/utils/theme'

const settingsStore=useSettingsStore(),ui=useUiStore(),{theme}=storeToRefs(settingsStore)
const values=ref<Settings>(),loading=ref(true)
onMounted(async()=>{try{values.value=await settingsRepository.get()}catch{ui.notify('Impostazioni non disponibili.','error')}finally{loading.value=false}})
async function changeTheme(value:string){try{await settingsStore.setTheme(value as ThemePreference);if(values.value)values.value.theme=value as ThemePreference}catch{ui.notify('Non è stato possibile salvare il tema.','error')}}
async function save(changes:Partial<Settings>){if(!values.value)return;const previous={...values.value};values.value={...values.value,...changes};try{await settingsRepository.save(values.value);ui.notify('Impostazione salvata.','success')}catch{values.value=previous;ui.notify('Salvataggio non riuscito.','error')}}
</script>
<template><div class="page"><AppPageHeader title="Impostazioni" back/><p v-if="loading" class="muted">Caricamento…</p><template v-else-if="values"><AppCard><section class="setting-section"><div><p class="eyebrow">Aspetto</p><h2>Tema</h2><p class="muted">La preferenza viene salvata su questo dispositivo.</p></div><AppSegmentedControl :model-value="theme" label="Tema dell’app" :options="[{value:'light',label:'Chiaro'},{value:'dark',label:'Scuro'},{value:'system',label:'Sistema'}]" @update:model-value="changeTheme"/><div class="theme-preview" aria-hidden="true"><Sun v-if="theme==='light'" :size="22"/><Moon v-else-if="theme==='dark'" :size="22"/><Monitor v-else :size="22"/><span>{{theme==='light'?'Tema chiaro attivo':theme==='dark'?'Tema scuro attivo':'Segue il dispositivo'}}</span></div></section></AppCard><AppCard><section class="setting-section"><div><p class="eyebrow">Inserimento pesi</p><h2>Modalità predefinita</h2></div><AppSegmentedControl :model-value="values.defaultWeightMode" label="Modalità peso predefinita" :options="[{value:'total',label:'Totale'},{value:'per_side',label:'Per parte'}]" @update:model-value="save({defaultWeightMode:$event as WeightMode})"/></section></AppCard><AppCard><section class="setting-section"><div><p class="eyebrow">Condivisione</p><h2>Testo condiviso</h2></div><label class="toggle"><input type="checkbox" :checked="values.showExportDate" @change="save({showExportDate:($event.target as HTMLInputElement).checked})"><span>Mostra la data nel testo esportato</span></label></section></AppCard></template></div></template>
<style scoped>.setting-section{display:grid;gap:var(--space-4)}.setting-section h2{margin:0;font-size:var(--text-lg)}.setting-section .muted{margin:var(--space-2) 0 0;line-height:1.5}.theme-preview{min-height:48px;display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3);color:var(--color-accent-text);border-radius:var(--radius-sm);background:var(--color-primary-soft);font-weight:700}.toggle{min-height:48px;display:flex;align-items:center;gap:var(--space-3);cursor:pointer}.toggle input{width:22px;height:22px;accent-color:var(--color-primary)}</style>
