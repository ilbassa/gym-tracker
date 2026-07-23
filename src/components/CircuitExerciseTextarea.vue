<script setup lang="ts">
import { computed, nextTick, ref, useId } from 'vue'
import { normalizeExerciseName } from '@/utils/exercise'

const props = withDefaults(defineProps<{ modelValue: string; suggestions: string[]; label: string; rows?: number; error?: string }>(), { rows: 5 })
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const id = useId()
const textarea = ref<HTMLTextAreaElement>()

const lines = computed(() => props.modelValue.split(/\r?\n/))
const currentQuery = computed(() => normalizeExerciseName(lines.value.at(-1) ?? ''))
const selected = computed(() => new Set(lines.value.slice(0, -1).map(normalizeExerciseName).filter(Boolean)))
const matches = computed(() => props.suggestions.filter((name) => {
  const normalized = normalizeExerciseName(name)
  return !selected.value.has(normalized) && (!currentQuery.value || normalized.includes(currentQuery.value))
}).slice(0, 6))

async function choose(name: string) {
  const nextLines = [...lines.value]
  nextLines[nextLines.length - 1] = name
  emit('update:modelValue', `${nextLines.join('\n')}\n`)
  await nextTick()
  textarea.value?.focus()
}
</script>

<template>
  <div class="field">
    <label class="field__label" :for="id">{{label}}</label>
    <textarea ref="textarea" :id="id" class="field__control" :class="{'field__control--error':error}" :value="modelValue" :rows="rows" placeholder="Scrivi un esercizio per riga" autocomplete="off" :aria-invalid="Boolean(error)" :aria-describedby="error?`${id}-error`:`${id}-suggestions`" @input="emit('update:modelValue',($event.target as HTMLTextAreaElement).value)" />
    <span v-if="error" :id="`${id}-error`" class="field__error">{{error}}</span>
    <div :id="`${id}-suggestions`" class="suggestions" aria-live="polite">
      <div class="suggestions__header">
        <strong>Suggerimenti dagli allenamenti precedenti</strong>
        <span v-if="suggestions.length">{{suggestions.length}} salvati</span>
      </div>
      <div v-if="matches.length" class="suggestions__list"><button v-for="name in matches" :key="name" type="button" @click="choose(name)">{{name}}</button></div>
      <p v-else-if="suggestions.length">Nessun esercizio corrisponde alla riga che stai scrivendo.</p>
      <p v-else>Nessun esercizio precedente su questo dispositivo. Dopo il primo salvataggio li troverai qui.</p>
    </div>
  </div>
</template>

<style scoped>
.field{display:grid;gap:var(--space-2)}
.field__label{font-size:var(--text-sm);font-weight:700}
.field__control{width:100%;padding:var(--space-3);color:var(--color-text);border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface);resize:vertical}
.field__control--error{border-color:var(--color-danger)}
.field__error{color:var(--color-danger);font-size:var(--text-sm)}
.suggestions{display:grid;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--color-border);border-radius:var(--radius-sm);background:var(--color-surface-subtle)}
.suggestions__header{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2)}
.suggestions__header strong{font-size:var(--text-sm)}
.suggestions__header span,.suggestions p{margin:0;color:var(--color-text-muted);font-size:var(--text-xs)}
.suggestions__list{display:flex;gap:var(--space-2);overflow-x:auto;padding-bottom:2px;scrollbar-width:thin}
.suggestions button{flex:none;min-height:36px;padding:0 var(--space-3);color:var(--color-accent-text);font-size:var(--text-sm);font-weight:700;border:0;border-radius:99px;background:var(--color-primary-soft);cursor:pointer}
.suggestions button:hover{background:var(--color-primary);color:var(--color-on-primary)}
</style>
