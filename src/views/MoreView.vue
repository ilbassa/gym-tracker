<script setup lang="ts">
import { ChevronRight, Database, Dumbbell, Settings } from 'lucide-vue-next'
import AppCard from '@/components/ui/AppCard.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'

const links = [
  { to: '/dashboard/esercizi', label: 'Esercizi', icon: Dumbbell },
  { to: '/dashboard/dati', label: 'Dati', icon: Database },
  { to: '/dashboard/impostazioni', label: 'Impostazioni', icon: Settings }
]
</script>
<template><div class="page"><AppPageHeader title="Altro" /><AppCard><nav class="more-list" aria-label="Altre sezioni"><RouterLink v-for="link in links" :key="link.to" :to="link.to"><component :is="link.icon" :size="22" aria-hidden="true"/><span>{{link.label}}</span><ChevronRight :size="20" aria-hidden="true"/></RouterLink></nav></AppCard></div></template>
<style scoped>.more-list{display:grid}.more-list a{min-height:54px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:var(--space-3);text-decoration:none;border-bottom:1px solid var(--color-border)}.more-list a:last-child{border:0}</style>
