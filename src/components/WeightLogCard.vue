<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next'
import AppCard from '@/components/ui/AppCard.vue'
import AppIconButton from '@/components/ui/AppIconButton.vue'
import type { WeightLogWithSets } from '@/models'
import { formatNumber } from '@/utils/number'

defineProps<{ log: WeightLogWithSets }>()
defineEmits<{ delete: [log: WeightLogWithSets] }>()
</script>
<template><AppCard><article class="log-card"><header><h2>{{log.exerciseName}}</h2><div><RouterLink class="edit-link" :to="`/dashboard/pesi/${log.id}/modifica`" aria-label="Modifica registrazione"><Pencil :size="20" aria-hidden="true"/></RouterLink><AppIconButton label="Elimina registrazione" :icon="Trash2" danger @click="$emit('delete',log)"/></div></header><ol class="set-list"><li v-for="(set,index) in log.sets" :key="set.id"><span>Serie {{index+1}}</span><strong>{{formatNumber(set.weight)}} kg × {{set.repetitions}}</strong><small v-if="set.weightMode==='per_side'">per parte</small></li></ol><p v-if="log.notes" class="notes">{{log.notes}}</p></article></AppCard></template>
<style scoped>.log-card header{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3)}.log-card h2{margin:0;font-size:var(--text-lg);text-transform:uppercase}.log-card header>div{display:flex;flex:none}.edit-link{width:44px;height:44px;display:grid;place-items:center;color:var(--color-text-muted);border-radius:50%}.edit-link:hover{color:var(--color-text);background:var(--color-surface-subtle)}.set-list{display:flex;gap:0;margin:var(--space-2) 0 0;padding:0;overflow-x:auto;list-style:none;font-variant-numeric:tabular-nums;scrollbar-width:thin}.set-list li{display:grid;flex:1 0 92px;gap:2px;padding:var(--space-2);border-left:1px solid var(--color-border)}.set-list li:first-child{padding-left:0;border-left:0}.set-list span,.set-list small{color:var(--color-text-muted);font-size:var(--text-xs)}.set-list strong{font-size:var(--text-sm);white-space:nowrap}.notes{margin:var(--space-2) 0 0;padding-top:var(--space-2);color:var(--color-text-muted);font-size:var(--text-sm);border-top:1px solid var(--color-border);white-space:pre-wrap}</style>
