<script setup lang="ts">
import { useId } from 'vue'

withDefaults(defineProps<{ modelValue?: string; label: string; options: Array<{ value: string; label: string }>; error?: string; compact?: boolean }>(), { modelValue: '', compact: false })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const id = useId()
</script>

<template>
  <label class="field" :class="{ 'field--compact': compact }" :for="id">
    <span class="field__label">{{ label }}</span>
    <select :id="id" class="field__control" :value="modelValue" :aria-invalid="Boolean(error)" :aria-describedby="error ? `${id}-error` : undefined" @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)">
      <option v-for="option in options" :key="option.value" :value="option.value">{{ option.label }}</option>
    </select>
    <span v-if="error" :id="`${id}-error`" class="field__error">{{ error }}</span>
  </label>
</template>

<style scoped>
.field { display: grid; gap: var(--space-2); }
.field__label { font-size: var(--text-sm); font-weight: 700; }
.field__control { width: 100%; min-height: var(--control-height); padding: 0 var(--space-3); color: var(--color-text); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); }
.field__error { color: var(--color-danger); font-size: var(--text-sm); }
.field--compact { gap: var(--space-1); min-width: 0; }
.field--compact .field__label { font-size: var(--text-xs); }
.field--compact .field__control { min-height: 44px; padding: 0 var(--space-1); font-size: var(--text-sm); }
</style>
