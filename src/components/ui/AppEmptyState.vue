<script setup lang="ts">
defineProps<{ title: string; description?: string }>()
</script>
<template><div class="empty"><slot name="icon" /><h2>{{ title }}</h2><p v-if="description">{{ description }}</p><div v-if="$slots.default" class="empty__actions"><slot /></div></div></template>
<style scoped>.empty { display: grid; justify-items: center; gap: var(--space-2); padding: var(--space-8) var(--space-4); text-align: center; border: 1px dashed var(--color-border); border-radius: var(--radius-md); }.empty h2 { margin: var(--space-2) 0 0; font-size: var(--text-lg); }.empty p { max-width: 36ch; margin: 0; color: var(--color-text-muted); }.empty__actions { width: 100%; display: grid; gap: var(--space-3); margin-top: var(--space-4); }</style>
