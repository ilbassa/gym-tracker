<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { WifiOff } from 'lucide-vue-next'
const offline=ref(typeof navigator!=='undefined'?!navigator.onLine:false)
const update=()=>offline.value=!navigator.onLine
onMounted(()=>{window.addEventListener('online',update);window.addEventListener('offline',update)})
onBeforeUnmount(()=>{window.removeEventListener('online',update);window.removeEventListener('offline',update)})
</script>
<template><div v-if="offline" class="offline" role="status"><WifiOff :size="16" aria-hidden="true"/>Modalità offline: i dati restano disponibili sul dispositivo.</div></template>
<style scoped>.offline{position:fixed;z-index:var(--z-nav);top:0;right:0;left:0;min-height:32px;display:flex;align-items:center;justify-content:center;gap:var(--space-2);padding:var(--space-1) var(--space-3);color:var(--color-on-primary);background:var(--color-primary);font-size:var(--text-xs);font-weight:750;text-align:center}</style>
