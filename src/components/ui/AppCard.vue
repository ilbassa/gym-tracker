<script setup lang="ts">
withDefaults(defineProps<{ compact?: boolean }>(), { compact: false })
</script>
<template><section class="card" :class="{ 'card--compact': compact }"><slot /></section></template>
<style scoped>.card { padding: var(--space-4); border: 1px solid var(--color-border); border-radius: var(--radius-md); background: var(--color-surface); box-shadow: var(--shadow-card); }.card--compact{padding:var(--space-2) var(--space-3)}</style>
