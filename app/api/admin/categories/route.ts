import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { verifyAdminRequest } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const db = createServiceClient()
  const { data, error } = await db
    .from('categories')
    .select('*, departments(id, name, slug)')
    .order('sort_order')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { department_id, name } = await req.json()
    if (!department_id || !name?.trim()) {
      return NextResponse.json({ error: 'department_id and name required' }, { status: 400 })
    }
    const db = createServiceClient()
    // Get max sort_order in dept
    const { data: existing } = await db
      .from('categories')
      .select('sort_order')
      .eq('department_id', department_id)
      .order('sort_order', { ascending: false })
      .limit(1)
    const nextSort = existing?.[0]?.sort_order != null ? existing[0].sort_order + 10 : 10
    const { data, error } = await db
      .from('categories')
      .insert({ department_id, name: name.trim(), sort_order: nextSort, is_active: true })
      .select()
      .single()
    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 })
  }
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
    const { error } = await db.from('categories').update(updates).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  if (!(await verifyAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })
    const db = createServiceClient()
    // Check for items in this category
    const { count } = await db
      .from('menu_items')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', id)
    if ((count ?? 0) > 0) {
      return NextResponse.json(
        { error: `Нельзя удалить — в категории ${count} позиций. Сначала перенесите или удалите блюда.` },
        { status: 409 }
      )
    }
    const { error } = await db.from('categories').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (e: unknown) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Error' }, { status: 500 })
  }
}
