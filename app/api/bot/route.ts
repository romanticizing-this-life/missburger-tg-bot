import { NextRequest, NextResponse } from 'next/server'
import { bot } from '@/lib/bot'
import { webhookCallback } from 'grammy'

const handleUpdate = webhookCallback(bot, 'std/http')

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-telegram-bot-api-secret-token')
  if (secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  try {
    return await handleUpdate(req)
  } catch (e) {
    console.error('Bot webhook error:', e)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
