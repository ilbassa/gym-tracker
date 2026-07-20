import type { Settings } from '@/models'

export type ThemePreference = Settings['theme']

export function applyTheme(theme: ThemePreference, root: HTMLElement = document.documentElement): void {
  if (theme === 'system') root.removeAttribute('data-theme')
  else root.dataset.theme = theme
}
