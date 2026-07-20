<script setup lang="ts">
import AppButton from './AppButton.vue'
import AppModal from './AppModal.vue'
withDefaults(defineProps<{ open: boolean; title: string; message: string; confirmLabel?: string; danger?: boolean }>(), { confirmLabel: 'Conferma', danger: false })
defineEmits<{ close: []; confirm: [] }>()
</script>
<template><AppModal :open="open" :title="title" @close="$emit('close')"><p class="message">{{ message }}</p><template #footer><AppButton variant="ghost" @click="$emit('close')">Annulla</AppButton><AppButton :variant="danger ? 'danger' : 'primary'" @click="$emit('confirm')">{{ confirmLabel }}</AppButton></template></AppModal></template>
<style scoped>.message{margin:0;line-height:1.55}</style>
