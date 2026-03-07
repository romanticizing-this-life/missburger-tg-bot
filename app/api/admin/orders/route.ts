import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const db = createServiceClient()
  const { searchParams } = new URL(req.url)

  if (searchParams.get('stats') === '1') {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const [todayRes, pendingRes] = await Promise.all([
      db
        .from('orders')
        .select('total')
        .gte('created_at', today.toISOString())
        .neq('status', 'cancelled'),
      db.from('orders').select('id').eq('status', 'pending'),
    ])
    const todayOrders = todayRes.data?.length || 0
    const todayRevenue = todayRes.data?.reduce((s, o) => s + (o.total || 0), 0) || 0
    const pendingOrders = pendingRes.data?.length || 0
    return NextResponse.json({ todayOrders, todayRevenue, pendingOrders })
  }

  const { data, error } = await db
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  try {
    const { orderId, status } = await req.json()
    const db = createServiceClient()
    const { error } = await db
      .from('orders')
      .update({ status })
      .eq('id', orderId)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Error' },
      { status: 500 }
    )
  }
}
