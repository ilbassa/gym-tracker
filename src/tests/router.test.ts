import { describe, expect, it } from 'vitest'
import router from '@/router'

describe('routing pubblico e dashboard', () => {
  it('mantiene la landing sulla root', () => {
    expect(router.resolve('/').name).toBe('landing')
  })

  it('espone tutte le route applicative sotto dashboard', () => {
    const applicationRoutes = router.getRoutes().filter((route) => route.name && route.name !== 'landing')
    expect(applicationRoutes.length).toBeGreaterThan(0)
    expect(applicationRoutes.every((route) => route.path.startsWith('/dashboard/'))).toBe(true)
    expect(router.getRoutes().find((route) => route.path === '/dashboard')?.redirect).toBe('/dashboard/oggi')
    expect(router.resolve('/dashboard/oggi').name).toBe('today')
  })
})
