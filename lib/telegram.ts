import { createHmac } from 'crypto'
import type { TelegramUser } from './types'

export function validateTelegramWebAppData(initData: string): boolean {
  try {
    const params = new URLSearchParams(initData)
    const hash = params.get('hash')
    if (!hash) return false
    params.delete('hash')
    const dataCheckString = [...params.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join('\n')
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(process.env.TELEGRAM_BOT_TOKEN!)
      .digest()
    const expectedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex')
    return hash === expectedHash
  } catch {
    return false
  }
}

export function parseTelegramUser(initData: string): TelegramUser | null {
  try {
    const params = new URLSearchParams(initData)
    const userStr = params.get('user')
    if (!userStr) return null
    return JSON.parse(userStr) as TelegramUser
  } catch {
    return null
  }
}
