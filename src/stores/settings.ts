import { defineStore } from 'pinia'
import { ref } from 'vue'
import { settingsRepository } from '@/repositories/settingsRepository'
import { applyTheme, type ThemePreference } from '@/utils/theme'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<ThemePreference>('system')
  const initialized = ref(false)

  async function initialize(force = false) {
    if (initialized.value && !force) return
    const settings = await settingsRepository.get()
    theme.value = settings.theme
    applyTheme(theme.value)
    initialized.value = true
  }

  async function setTheme(value: ThemePreference) {
    const previous = theme.value
    theme.value = value
    applyTheme(value)
    try {
      const settings = await settingsRepository.get()
      await settingsRepository.save({ ...settings, theme: value })
    } catch (error) {
      theme.value = previous
      applyTheme(previous)
      throw error
    }
  }

  return { theme, initialized, initialize, setTheme }
})
