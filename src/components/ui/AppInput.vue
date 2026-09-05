<script setup lang="ts">
import { computed, useId } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  label: string
  type?: string
  error?: string
  hint?: string
  inputmode?: 'none' | 'text' | 'decimal' | 'numeric' | 'tel' | 'search' | 'email' | 'url'
  min?: string | number
  step?: string | number
  autocomplete?: string
  list?: string
  required?: boolean
  compact?: boolean
}>(), { modelValue: '', type: 'text' })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const id = useId()
const describedBy = computed(() => props.error ? `${id}-error` : props.hint ? `${id}-hint` : undefined)
</script>

<template>
  <div class="field" :class="{ 'field--compact': compact }">
    <label class="field__label" :for="id">{{ label }}<span v-if="required" aria-hidden="true"> *</span></label>
    <div class="field__input" :class="{ 'field__input--suffix': $slots.suffix }">
    <input :id="id" class="field__control" :class="{ 'field__control--error': error }" :value="modelValue" :type="type" :inputmode="inputmode" :min="min" :step="step" :autocomplete="autocomplete" :list="list" :required="required" :aria-invalid="Boolean(error)" :aria-describedby="describedBy" @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />
      <div v-if="$slots.suffix" class="field__suffix"><slot name="suffix" /></div>
    </div>
    <span v-if="error" :id="`${id}-error`" class="field__error">{{ error }}</span>
    <span v-else-if="hint" :id="`${id}-hint`" class="field__hint">{{ hint }}</span>
  </div>
</template>

<style scoped>
.field { display: grid; gap: var(--space-2); }
.field__label { font-size: var(--text-sm); font-weight: 700; }
.field__control { width: 100%; min-height: var(--control-height); padding: 0 var(--space-3); color: var(--color-text); border: 1px solid var(--color-border); border-radius: var(--radius-sm); background: var(--color-surface); }
.field__control--error { border-color: var(--color-danger); }
.field__error { color: var(--color-danger); font-size: var(--text-sm); }
.field__hint { color: var(--color-text-muted); font-size: var(--text-sm); }
.field--compact { gap: var(--space-1); min-width: 0; }
.field--compact .field__label { font-size: var(--text-xs); }
.field--compact .field__control { min-height: 44px; padding: 0 var(--space-2); font-variant-numeric: tabular-nums; }
.field--compact .field__error { font-size: var(--text-xs); }
.field__input { position: relative; min-width: 0; }
.field__input--suffix .field__control { padding-right: 48px; }
.field__suffix { position: absolute; top: 1px; right: 1px; bottom: 1px; display: flex; align-items: center; }
</style>
