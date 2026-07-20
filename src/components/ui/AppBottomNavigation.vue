<script setup lang="ts">
import { CalendarDays, ChartNoAxesColumn, CircleEllipsis, History } from 'lucide-vue-next'
const items = [
  { to: '/dashboard/oggi', label: 'Oggi', icon: CalendarDays },
  { to: '/dashboard/storico', label: 'Storico', icon: History },
  { to: '/dashboard/riepilogo', label: 'Riepilogo', icon: ChartNoAxesColumn },
  { to: '/dashboard/altro', label: 'Altro', icon: CircleEllipsis }
]
</script>
<template><nav class="bottom-nav" aria-label="Navigazione principale"><RouterLink v-for="item in items" :key="item.to" :to="item.to" class="bottom-nav__item"><component :is="item.icon" :size="22" aria-hidden="true" /><span>{{ item.label }}</span></RouterLink></nav></template>
<style scoped>.bottom-nav{position:fixed;z-index:var(--z-nav);right:0;bottom:0;left:0;display:grid;grid-template-columns:repeat(4,1fr);padding:var(--space-1) max(var(--space-2),env(safe-area-inset-right)) calc(var(--space-1) + env(safe-area-inset-bottom)) max(var(--space-2),env(safe-area-inset-left));border-top:1px solid var(--color-border);background:color-mix(in srgb,var(--color-surface) 94%,transparent);backdrop-filter:blur(12px)}.bottom-nav__item{min-height:58px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;color:var(--color-text-muted);border-radius:var(--radius-sm);font-size:var(--text-xs);font-weight:650;text-decoration:none}.bottom-nav__item.router-link-active{color:var(--color-accent-text);background:var(--color-primary-soft)}@media(min-width:760px){.bottom-nav{width:min(100%,720px);margin:0 auto;border-right:1px solid var(--color-border);border-left:1px solid var(--color-border);border-radius:var(--radius-lg) var(--radius-lg) 0 0}}</style>
