<script setup lang="ts">
import type { Component } from 'vue'
withDefaults(defineProps<{ label: string; icon: Component; danger?: boolean; disabled?: boolean }>(), { danger: false, disabled: false })
</script>
<template><button type="button" class="icon-button" :class="{ 'icon-button--danger': danger }" :aria-label="label" :title="label" :disabled="disabled"><component :is="icon" :size="20" aria-hidden="true" /></button></template>
<style scoped>.icon-button { width: 44px; height: 44px; display: inline-grid; place-items: center; padding: 0; color: var(--color-text-muted); border: 0; border-radius: 50%; background: transparent; cursor: pointer; }.icon-button:hover { background: var(--color-surface-subtle); color: var(--color-text); }.icon-button--danger { color: var(--color-danger); }</style>
