import { db as defaultDb, type GymTrackerDatabase } from '@/db/database'
import type { Settings } from '@/models'

export const defaultSettings: Settings = { theme: 'system', defaultWeightMode: 'total', exportFormat: 'compact', showExportDate: true }

export class SettingsRepository {
  constructor(private readonly database: GymTrackerDatabase = defaultDb) {}
  async get(): Promise<Settings> { return (await this.database.settings.get('app'))?.value ?? { ...defaultSettings } }
  async save(value: Settings): Promise<void> { await this.database.settings.put({ key: 'app', value }) }
}

export const settingsRepository = new SettingsRepository()
