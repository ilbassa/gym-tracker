<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useUiStore } from '@/stores/ui'

const { toast } = storeToRefs(useUiStore())
</script>
<template><Teleport to="body"><Transition name="fade"><div v-if="toast" class="toast" :class="`toast--${toast.tone}`" role="status" aria-live="polite">{{ toast.message }}</div></Transition></Teleport></template>
<style scoped>.toast{position:fixed;z-index:var(--z-toast);right:var(--space-4);bottom:calc(88px + env(safe-area-inset-bottom));left:var(--space-4);max-width:520px;margin:auto;padding:var(--space-3) var(--space-4);color:white;border-radius:var(--radius-md);background:#263244;box-shadow:0 8px 30px rgb(0 0 0/.2)}.toast--success{background:var(--color-positive)}.toast--error{background:var(--color-danger)}</style>
