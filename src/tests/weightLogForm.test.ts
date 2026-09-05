import { createApp, nextTick, type App } from 'vue'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import WeightLogFormView from '@/views/WeightLogFormView.vue'

const mocks = vi.hoisted(() => ({
  route: { params: {} as Record<string, string> },
  save: vi.fn(), get: vi.fn(), latest: vi.fn(), push: vi.fn(), notify: vi.fn()
}))
vi.mock('vue-router', () => ({ useRoute: () => mocks.route, useRouter: () => ({ push: mocks.push, replace: vi.fn(), back: vi.fn() }) }))
vi.mock('@/stores/ui', () => ({ useUiStore: () => ({ notify: mocks.notify }) }))
vi.mock('@/repositories/settingsRepository', () => ({ settingsRepository: { get: async () => ({ defaultWeightMode: 'total' }) } }))
vi.mock('@/repositories/exerciseRepository', () => ({ exerciseRepository: {
  list: async () => [{ id: 'hold', name: 'Tenuta', normalizedName: 'tenuta' }],
  findOrCreate: async () => ({ id: 'hold', name: 'Tenuta' })
} }))
vi.mock('@/repositories/weightLogRepository', () => ({ weightLogRepository: {
  save: mocks.save, get: mocks.get, getLatestForExercise: mocks.latest, findSameExerciseOnDate: async () => undefined
} }))

let app: App
let host: HTMLDivElement
const flush = async () => { await new Promise(resolve => setTimeout(resolve, 0)); await nextTick() }
async function mount() {
  app = createApp(WeightLogFormView)
  app.component('RouterLink', { template: '<a><slot /></a>' })
  app.mount(host); await flush()
}
function input(label: string, index = 0): HTMLInputElement {
  const labels = [...host.querySelectorAll('label')].filter(node => node.textContent?.startsWith(label))
  return document.getElementById(labels[index]!.htmlFor) as HTMLInputElement
}
async function fill(label: string, value: string, index = 0) {
  const field = input(label, index); field.value = value; field.dispatchEvent(new Event('input', { bubbles: true })); await nextTick()
}
async function click(text: string, index = 0) {
  const buttons = [...host.querySelectorAll('button')].filter(node => node.textContent?.trim() === text)
  buttons[index]!.click(); await flush()
}
async function unit(value: string) {
  const select = host.querySelector<HTMLSelectElement>('.duration-unit')!
  select.value = value; select.dispatchEvent(new Event('change', { bubbles: true })); await nextTick()
}
beforeEach(() => {
  vi.clearAllMocks(); mocks.route.params = {}; mocks.latest.mockResolvedValue(undefined)
  host = document.createElement('div'); document.body.append(host)
})
afterEach(() => { app?.unmount(); host.remove() })

describe('form serie a tempo', () => {
  it('alterna la modalità senza aggiungere campi numerici e conserva i valori', async () => {
    await mount()
    expect(host.querySelector('.duration-unit')).toBeNull()
    await fill('Ripetiz.', '12')
    await click('A tempo')
    expect(host.querySelectorAll('.set-grid input')).toHaveLength(2)
    expect(input('Durata').value).toBe('')
    await fill('Durata', '90')
    await unit('minutes')
    expect(input('Durata').value).toBe('1.5')
    await click('Ripetizioni')
    expect(input('Ripetiz.').value).toBe('12')
    await click('A tempo')
    expect(input('Durata').value).toBe('1.5')
    await unit('seconds')
    expect(input('Durata').value).toBe('90')
  })

  it('valida la durata, duplica la serie e salva minuti decimali come secondi', async () => {
    await mount(); await fill('Esercizio pesi', 'Tenuta'); await click('A tempo')
    await click('Salva allenamento')
    expect(host.textContent).toContain('Inserisci una durata maggiore di zero.')
    expect(mocks.save).not.toHaveBeenCalled()
    await unit('minutes'); await fill('Durata', '1,5'); await click('Aggiungi serie')
    expect(input('Durata', 1).value).toBe('1,5')
    await click('Salva allenamento')
    expect(mocks.save).toHaveBeenCalledWith(expect.objectContaining({ sets: [
      { weight: 0, weightMode: 'total', repetitions: 0, durationSeconds: 90, durationUnit: 'minutes' },
      { weight: 0, weightMode: 'total', repetitions: 0, durationSeconds: 90, durationUnit: 'minutes' }
    ] }))
  })

  it('ricarica e copia una registrazione a tempo con la sua unità', async () => {
    const log = { date: '2026-09-05', exerciseName: 'Tenuta', notes: '', sets: [
      { weight: 10, weightMode: 'per_side', repetitions: 0, durationSeconds: 90, durationUnit: 'minutes' }
    ] }
    mocks.route.params = { id: 'saved' }; mocks.get.mockResolvedValue(log); mocks.latest.mockResolvedValue(log)
    await mount()
    expect(input('Durata').value).toBe('1.5')
    expect(host.querySelector<HTMLSelectElement>('.duration-unit')?.value).toBe('minutes')
    await fill('Durata', '2'); await click('Copia')
    expect(input('Durata').value).toBe('1.5')
    expect(input('Peso kg').value).toBe('10')
  })
})
