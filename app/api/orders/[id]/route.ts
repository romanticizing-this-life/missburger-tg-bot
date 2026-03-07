import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const db = createServiceClient()
    const { data: order, error } = await db
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', id)
      .single()
    if (error) throw error
    return NextResponse.json(order)
  } catch (e: unknown) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Not found' },
      { status: 404 }
    )
  }
}
