import { createHmac } from 'crypto'

function secret() {
  return process.env.TELEGRAM_WEBHOOK_SECRET!
}

export function generateAdminToken(telegramId: number): string {
  const payload = Buffer.from(
    JSON.stringify({ id: telegramId, exp: Date.now() + 3600 * 1000 })
  ).toString('base64url')
  const sig = createHmac('sha256', secret()).update(payload).digest('hex')
  return `${payload}.${sig}`
}

export function verifyAdminToken(token: string): { id: number } | null {
  try {
    const dotIdx = token.lastIndexOf('.')
    if (dotIdx === -1) return null
    const payload = token.slice(0, dotIdx)
    const sig = token.slice(dotIdx + 1)
    const expectedSig = createHmac('sha256', secret()).update(payload).digest('hex')
    if (sig !== expectedSig) return null
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    if (!data.exp || Date.now() > data.exp) return null
    return { id: data.id }
  } catch {
    return null
  }
}
