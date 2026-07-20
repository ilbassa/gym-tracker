import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUiStore = defineStore('ui', () => {
  const toast = ref<{ message: string; tone: 'info' | 'success' | 'error' } | null>(null)
  let timeout: ReturnType<typeof setTimeout> | undefined

  function notify(message: string, tone: 'info' | 'success' | 'error' = 'info') {
    toast.value = { message, tone }
    clearTimeout(timeout)
    timeout = setTimeout(() => { toast.value = null }, 3500)
  }

  return { toast, notify }
})
