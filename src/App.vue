<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppBottomNavigation from '@/components/ui/AppBottomNavigation.vue'
import AppToast from '@/components/ui/AppToast.vue'
import OfflineStatus from '@/components/OfflineStatus.vue'
import PwaUpdatePrompt from '@/components/PwaUpdatePrompt.vue'
import { useSettingsStore } from '@/stores/settings'
import { useUiStore } from '@/stores/ui'

const settings = useSettingsStore()
const ui = useUiStore()
const route = useRoute()
const isDashboard = computed(() => route.path.startsWith('/dashboard'))
onMounted(async () => {
  try { await settings.initialize() }
  catch { ui.notify('Non è stato possibile caricare il tema salvato.', 'error') }
})
</script>

<template>
  <div class="app-shell">
    <a class="skip-link" href="#contenuto">Vai al contenuto</a>
    <main id="contenuto" :class="isDashboard ? 'app-main' : 'landing-main'">
      <RouterView />
    </main>
    <AppBottomNavigation v-if="isDashboard" />
    <OfflineStatus />
    <PwaUpdatePrompt />
    <AppToast />
  </div>
</template>
