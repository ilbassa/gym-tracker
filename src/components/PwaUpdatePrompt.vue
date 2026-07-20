<script setup lang="ts">
import { watch } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import AppButton from '@/components/ui/AppButton.vue'
import { useUiStore } from '@/stores/ui'
const ui=useUiStore(),{needRefresh,offlineReady,updateServiceWorker}=useRegisterSW({immediate:true})
watch(offlineReady,(ready)=>{if(ready)ui.notify('App pronta per l’uso offline.','success')})
</script>
<template><div v-if="needRefresh" class="update-prompt" role="status"><span>È disponibile un aggiornamento.</span><AppButton @click="updateServiceWorker(true)">Aggiorna ora</AppButton><AppButton variant="ghost" @click="needRefresh=false">Più tardi</AppButton></div></template>
<style scoped>.update-prompt{position:fixed;z-index:calc(var(--z-toast) - 1);right:var(--space-4);bottom:calc(88px + env(safe-area-inset-bottom));left:var(--space-4);max-width:680px;display:flex;align-items:center;flex-wrap:wrap;gap:var(--space-2);margin:auto;padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-md);background:var(--color-surface);box-shadow:0 10px 35px rgb(0 0 0/.18)}.update-prompt span{flex:1;min-width:180px;font-weight:700}</style>
