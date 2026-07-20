import { describe, expect, it } from 'vitest'
import { applyTheme } from '@/utils/theme'

describe('tema', () => {
  it('applica esplicitamente tema chiaro e scuro', () => {
    const root = document.createElement('html')
    applyTheme('dark', root)
    expect(root.dataset.theme).toBe('dark')
    applyTheme('light', root)
    expect(root.dataset.theme).toBe('light')
  })

  it('lascia il tema alla preferenza di sistema', () => {
    const root = document.createElement('html')
    root.dataset.theme = 'dark'
    applyTheme('system', root)
    expect(root.hasAttribute('data-theme')).toBe(false)
  })
})
