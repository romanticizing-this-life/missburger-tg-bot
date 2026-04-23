import { NextRequest, NextResponse } from 'next/server'
import { validateTelegramWebAppData, parseTelegramUser } from '@/lib/telegram'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const initData = req.headers.get('x-init-data') || ''

  if (!initData || !validateTelegramWebAppData(initData)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = parseTelegramUser(initData)
  if (!user) return NextResponse.json({ error: 'No user' }, { status: 401 })

  const db = createServiceClient()

  const { data: userData } = await db
    .from('users')
    .select('id')
    .eq('telegram_id', user.id)
    .single()

  if (!userData) return NextResponse.json([])

  const { data: orders, error } = await db
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', userData.id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(orders || [])
}
