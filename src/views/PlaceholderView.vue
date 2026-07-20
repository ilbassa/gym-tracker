<script setup lang="ts">
import AppEmptyState from '@/components/ui/AppEmptyState.vue'
import AppPageHeader from '@/components/ui/AppPageHeader.vue'

defineProps<{ title: string }>()
</script>
<template><div class="page"><AppPageHeader :title="title" /><AppEmptyState title="In arrivo nelle prossime fasi" description="Questa sezione sarà implementata secondo il piano concordato." /></div></template>
