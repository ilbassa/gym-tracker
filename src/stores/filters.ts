import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useHistoryFiltersStore = defineStore('history-filters', () => {
  const from = ref(''), to = ref(''), type = ref<'all' | 'weights' | 'cardio'>('all'), exerciseId = ref('')
  function reset() { from.value = ''; to.value = ''; type.value = 'all'; exerciseId.value = '' }
  return { from, to, type, exerciseId, reset }
})
