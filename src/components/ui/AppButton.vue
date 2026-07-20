<script setup lang="ts">
import type { Component } from 'vue'

withDefaults(defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  type?: 'button' | 'submit' | 'reset'
  block?: boolean
  disabled?: boolean
  icon?: Component
}>(), { variant: 'primary', type: 'button', block: false, disabled: false })
</script>

<template>
  <button :type="type" class="app-button" :class="[`app-button--${variant}`, { 'app-button--block': block }]" :disabled="disabled">
    <component :is="icon" v-if="icon" :size="20" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.app-button { min-height: var(--control-height); display: inline-flex; align-items: center; justify-content: center; gap: var(--space-2); padding: 0 var(--space-4); border: 1px solid transparent; border-radius: var(--radius-md); font-weight: 700; cursor: pointer; }
.app-button:disabled { opacity: .5; cursor: not-allowed; }
.app-button--block { width: 100%; }
.app-button--primary { color: var(--color-on-primary); background: var(--color-primary); }
.app-button--primary:hover { background: var(--color-primary-strong); }
.app-button--secondary { color: var(--color-accent-text); border-color: var(--color-border); background: var(--color-surface); }
.app-button--danger { color: white; background: var(--color-danger); }
.app-button--ghost { color: var(--color-text); background: transparent; }
</style>
