<script setup lang="ts">
import { computed, useId } from 'vue'
import AppInput from '@/components/ui/AppInput.vue'
import type { Exercise } from '@/models'

const props = defineProps<{ modelValue: string; exercises: Exercise[]; label: string; error?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const listId = `exercises-${useId().replaceAll(':', '')}`
const activeExercises = computed(() => props.exercises.filter((exercise) => exercise.active))
</script>
<template><div><AppInput :model-value="modelValue" :label="label" :error="error" :list="listId" autocomplete="off" required @update:model-value="emit('update:modelValue', $event)" /><datalist :id="listId"><option v-for="exercise in activeExercises" :key="exercise.id" :value="exercise.name" /></datalist></div></template>
