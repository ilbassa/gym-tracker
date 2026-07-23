import { describe, expect, it } from 'vitest'
import { recentWorkoutStart, shouldShowDriveBackupReminder } from '@/services/backupReminder'

const now = new Date('2026-07-23T12:00:00.000Z')

describe('promemoria backup Google Drive', () => {
  it('parte dai 30 giorni inclusivi', () => expect(recentWorkoutStart(now)).toBe('2026-06-24'))
  it('non appare senza allenamenti recenti', () => expect(shouldShowDriveBackupReminder(undefined, false, now)).toBe(false))
  it('appare con allenamenti recenti e nessun backup', () => expect(shouldShowDriveBackupReminder(undefined, true, now)).toBe(true))
  it('appare oltre 30 giorni dall’ultimo backup', () => expect(shouldShowDriveBackupReminder('2026-06-22T11:59:59.000Z', true, now)).toBe(true))
  it('non appare se il backup è recente', () => expect(shouldShowDriveBackupReminder('2026-07-01T12:00:00.000Z', true, now)).toBe(false))
})
