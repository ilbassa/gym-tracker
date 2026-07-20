<script setup lang="ts">
import { ArrowLeft } from 'lucide-vue-next'
withDefaults(defineProps<{ title: string; subtitle?: string; back?: boolean; backTo?: string }>(), { backTo: '/dashboard/oggi' })
</script>
<template>
  <header class="page-header">
    <RouterLink v-if="back" class="page-header__back" :to="backTo" aria-label="Torna alla pagina precedente"><ArrowLeft :size="22" aria-hidden="true" /></RouterLink>
    <div class="page-header__text"><h1>{{ title }}</h1><p v-if="subtitle">{{ subtitle }}</p></div>
    <div v-if="$slots.actions" class="page-header__actions"><slot name="actions" /></div>
  </header>
</template>
<style scoped>.page-header { min-height: 56px; display: flex; align-items: flex-start; gap: var(--space-3); }.page-header__back { flex: none; width: 44px; height: 44px; display: grid; place-items: center; margin-left: -10px; border-radius: 50%; }.page-header__text { min-width: 0; flex: 1; }.page-header h1 { margin: 0; font-size: var(--text-xl); line-height: 1.15; }.page-header p { margin: var(--space-1) 0 0; color: var(--color-text-muted); }.page-header__actions { display: flex; gap: var(--space-2); }</style>
