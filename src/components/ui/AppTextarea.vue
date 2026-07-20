<script setup lang="ts">
import { useId } from 'vue'
withDefaults(defineProps<{ modelValue?: string; label: string; rows?: number; hint?: string; error?: string }>(), { modelValue: '', rows: 3 })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const id = useId()
</script>
<template><label class="field" :for="id"><span class="field__label">{{ label }}</span><textarea :id="id" class="field__control" :class="{'field__control--error':error}" :value="modelValue" :rows="rows" :aria-invalid="Boolean(error)" :aria-describedby="error?`${id}-error`:hint?`${id}-hint`:undefined" @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)" /><span v-if="error" :id="`${id}-error`" class="field__error">{{error}}</span><span v-else-if="hint" :id="`${id}-hint`" class="field__hint">{{ hint }}</span></label></template>
<style scoped>.field{display:grid;gap:var(--space-2)}.field__label{font-size:var(--text-sm);font-weight:700}.field__control{width:100%;padding:var(--space-3);color:var(--color-text);border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface);resize:vertical}.field__control--error{border-color:var(--color-danger)}.field__error{color:var(--color-danger);font-size:var(--text-sm)}.field__hint{color:var(--color-text-muted);font-size:var(--text-sm)}</style>
