import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { verifyAdminRequest } from '@/lib/adminAuth'

export async function GET() {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const db = createServiceClient()
  const { data, error } = await db
    .from('departments')
    .select('*')
    .order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    const { id, ...updates } = body
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const db = createServiceClient()
    const allowed = ['name', 'icon', 'open_time', 'close_time', 'sort_order', 'is_active']
    const safe = Object.fromEntries(Object.entries(updates).filter(([k]) => allowed.includes(k)))
    // Normalize empty strings → null for time fields
    if ('open_time' in safe && !safe.open_time) safe.open_time = null
    if ('close_time' in safe && !safe.close_time) safe.close_time = null
    const { error } = await db.from('departments').update(safe).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 })
  }
}
