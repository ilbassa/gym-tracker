import { toDateKey } from '@/utils/date'

const REMINDER_DAYS = 30
const DAY_MS = 86_400_000

export function recentWorkoutStart(now = new Date()): string {
  const start = new Date(now)
  start.setHours(12, 0, 0, 0)
  start.setDate(start.getDate() - (REMINDER_DAYS - 1))
  return toDateKey(start)
}

export function shouldShowDriveBackupReminder(lastSyncAt: string | undefined, hasRecentWorkouts: boolean, now = new Date()): boolean {
  if (!hasRecentWorkouts) return false
  if (!lastSyncAt) return true
  const lastSyncTime = Date.parse(lastSyncAt)
  if (!Number.isFinite(lastSyncTime)) return true
  return now.getTime() - lastSyncTime > REMINDER_DAYS * DAY_MS
}
