<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { X } from 'lucide-vue-next'
import AppIconButton from './AppIconButton.vue'

const props = defineProps<{ open: boolean; title: string }>()
const emit = defineEmits<{ close: [] }>()
const dialog = ref<HTMLElement | null>(null)
let returnFocus: HTMLElement | null = null

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
  if (event.key !== 'Tab' || !dialog.value) return
  const items = [...dialog.value.querySelectorAll<HTMLElement>('button, input, select, textarea, a[href], [tabindex]:not([tabindex="-1"])')].filter((item) => !item.hasAttribute('disabled'))
  if (!items.length) return
  const first = items[0]
  const last = items[items.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
}

watch(() => props.open, async (open) => {
  if (open) {
    returnFocus = document.activeElement as HTMLElement
    document.addEventListener('keydown', onKeydown)
    await nextTick()
    dialog.value?.querySelector<HTMLElement>('button, input, select, textarea')?.focus()
  } else {
    document.removeEventListener('keydown', onKeydown)
    returnFocus?.focus()
  }
})
onBeforeUnmount(() => document.removeEventListener('keydown', onKeydown))
</script>
<template><Teleport to="body"><Transition name="fade"><div v-if="open" class="overlay" @mousedown.self="emit('close')"><section ref="dialog" class="modal" role="dialog" aria-modal="true" :aria-labelledby="`modal-${title}`"><header><h2 :id="`modal-${title}`">{{ title }}</h2><AppIconButton label="Chiudi" :icon="X" @click="emit('close')" /></header><div class="modal__body"><slot /></div><footer v-if="$slots.footer"><slot name="footer" /></footer></section></div></Transition></Teleport></template>
<style scoped>.overlay { position: fixed; inset: 0; z-index: var(--z-overlay); display: grid; align-items: end; padding: var(--space-3); background: rgb(8 13 24 / .58); }.modal { width: min(100%, 520px); max-height: min(86vh, 760px); display: flex; flex-direction: column; margin: 0 auto; border-radius: var(--radius-lg); background: var(--color-surface); overflow: hidden; }.modal header { display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); border-bottom: 1px solid var(--color-border); }.modal h2 { margin: 0; font-size: var(--text-lg); }.modal__body { padding: var(--space-4); overflow: auto; }.modal footer { display: flex; justify-content: flex-end; gap: var(--space-3); padding: var(--space-4); border-top: 1px solid var(--color-border); }@media(min-width:600px){.overlay{align-items:center}}</style>
