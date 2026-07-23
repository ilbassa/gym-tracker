import type { BackupData } from '@/repositories/backupRepository'

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata'
const BACKUP_FILE_NAME = 'gym-tracker-backup.json'
const GOOGLE_SCRIPT_URL = 'https://accounts.google.com/gsi/client'
const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3'
const DRIVE_UPLOAD_URL = 'https://www.googleapis.com/upload/drive/v3'

interface GoogleTokenResponse {
  access_token?: string
  error?: string
  error_description?: string
  expires_in?: number
}

interface GoogleTokenClient {
  requestAccessToken(options?: { prompt?: string }): void
}

interface GoogleOAuth {
  initTokenClient(config: {
    client_id: string
    scope: string
    callback: (response: GoogleTokenResponse) => void
    error_callback?: (error: unknown) => void
  }): GoogleTokenClient
}

declare global {
  interface Window {
    google?: { accounts: { oauth2: GoogleOAuth } }
  }
}

interface DriveFile {
  id: string
  name: string
  modifiedTime?: string
}

interface DriveFileList {
  files?: DriveFile[]
}

export class GoogleDriveBackupError extends Error {
  constructor(public readonly code: 'not_configured' | 'authorization_failed' | 'no_backup' | 'request_failed', message: string) {
    super(message)
  }
}

let googleScriptPromise: Promise<void> | undefined

function loadGoogleScript(): Promise<void> {
  if (window.google?.accounts.oauth2) return Promise.resolve()
  if (googleScriptPromise) return googleScriptPromise
  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GOOGLE_SCRIPT_URL}"]`)
    const script = existing ?? document.createElement('script')
    const loaded = () => window.google?.accounts.oauth2 ? resolve() : reject(new Error('Google Identity Services non disponibile.'))
    script.addEventListener('load', loaded, { once: true })
    script.addEventListener('error', () => reject(new Error('Caricamento di Google Identity Services non riuscito.')), { once: true })
    if (!existing) {
      script.src = GOOGLE_SCRIPT_URL
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
  })
  return googleScriptPromise
}

export class GoogleDriveBackupService {
  private accessToken?: string
  private tokenExpiresAt = 0

  constructor(private readonly clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() ?? '') {}

  get configured(): boolean { return Boolean(this.clientId) }

  prepare(): Promise<void> {
    return this.configured ? loadGoogleScript() : Promise.resolve()
  }

  private async authorize(): Promise<string> {
    if (!this.configured) throw new GoogleDriveBackupError('not_configured', 'Google Drive non è configurato.')
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60_000) return this.accessToken
    try { await loadGoogleScript() }
    catch (error) { throw new GoogleDriveBackupError('authorization_failed', error instanceof Error ? error.message : 'Accesso a Google non riuscito.') }

    return new Promise<string>((resolve, reject) => {
      const oauth = window.google?.accounts.oauth2
      if (!oauth) {
        reject(new GoogleDriveBackupError('authorization_failed', 'Google Identity Services non disponibile.'))
        return
      }
      const client = oauth.initTokenClient({
        client_id: this.clientId,
        scope: DRIVE_SCOPE,
        callback: (response) => {
          if (!response.access_token) {
            reject(new GoogleDriveBackupError('authorization_failed', response.error_description ?? 'Autorizzazione Google annullata o non riuscita.'))
            return
          }
          this.accessToken = response.access_token
          this.tokenExpiresAt = Date.now() + (response.expires_in ?? 3600) * 1000
          resolve(response.access_token)
        },
        error_callback: () => reject(new GoogleDriveBackupError('authorization_failed', 'Autorizzazione Google annullata o non riuscita.'))
      })
      client.requestAccessToken()
    })
  }

  private async request(url: string, init: RequestInit = {}): Promise<Response> {
    const token = await this.authorize()
    const headers = new Headers(init.headers)
    headers.set('Authorization', `Bearer ${token}`)
    const response = await fetch(url, { ...init, headers })
    if (!response.ok) throw new GoogleDriveBackupError('request_failed', `Google Drive ha risposto con errore ${response.status}.`)
    return response
  }

  private async findBackup(): Promise<DriveFile | undefined> {
    const params = new URLSearchParams({
      spaces: 'appDataFolder',
      q: `name='${BACKUP_FILE_NAME}' and trashed=false`,
      orderBy: 'modifiedTime desc',
      pageSize: '1',
      fields: 'files(id,name,modifiedTime)'
    })
    const response = await this.request(`${DRIVE_API_URL}/files?${params}`)
    const result = await response.json() as DriveFileList
    return result.files?.[0]
  }

  async upload(data: BackupData): Promise<void> {
    const existing = await this.findBackup()
    const metadata = existing
      ? { name: BACKUP_FILE_NAME, mimeType: 'application/json' }
      : { name: BACKUP_FILE_NAME, mimeType: 'application/json', parents: ['appDataFolder'] }
    const body = new FormData()
    body.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
    body.append('file', new Blob([JSON.stringify(data)], { type: 'application/json' }), BACKUP_FILE_NAME)
    const path = existing ? `/files/${encodeURIComponent(existing.id)}` : '/files'
    await this.request(`${DRIVE_UPLOAD_URL}${path}?uploadType=multipart&fields=id,modifiedTime`, {
      method: existing ? 'PATCH' : 'POST',
      body
    })
  }

  async download(): Promise<unknown> {
    const backup = await this.findBackup()
    if (!backup) throw new GoogleDriveBackupError('no_backup', 'Nessun backup di Gym Tracker trovato su Google Drive.')
    const response = await this.request(`${DRIVE_API_URL}/files/${encodeURIComponent(backup.id)}?alt=media`)
    return response.json()
  }
}

export const googleDriveBackupService = new GoogleDriveBackupService()
