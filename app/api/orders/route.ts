import { NextRequest, NextResponse } from 'next/server'
import { validateTelegramWebAppData, parseTelegramUser } from '@/lib/telegram'
import { createServiceClient } from '@/lib/supabase'
import { sendOrderToClopos } from '@/lib/clopos'
import { sendOrderConfirmation, notifyAdminNewOrder } from '@/lib/bot'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { initData, orderType, locationId, deliveryAddress, comment, items, total } = body

    // Validate Telegram auth (allow bypass in dev with empty initData)
    let telegramId: number | null = null
    let userName = 'Unknown'
    if (initData) {
      if (!validateTelegramWebAppData(initData)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      const user = parseTelegramUser(initData)
      if (user) {
        telegramId = user.id
        userName = user.first_name
      }
    }

    const db = createServiceClient()

    // Upsert user
    let userId: number | null = null
    if (telegramId) {
      const user = parseTelegramUser(initData)
      const { data: upsertedUser, error: userError } = await db
        .from('users')
        .upsert(
          {
            telegram_id: telegramId,
            first_name: user?.first_name || '',
            last_name: user?.last_name || null,
            username: user?.username || null,
          },
          { onConflict: 'telegram_id' }
        )
        .select('id')
        .single()
      if (userError) throw userError
      userId = upsertedUser.id
    }

    // Create order
    const { data: order, error: orderError } = await db
      .from('orders')
      .insert({
        user_id: userId,
        location_id: locationId,
        order_type: orderType,
        status: 'pending',
        total,
        delivery_address: deliveryAddress || null,
        comment: comment || null,
      })
      .select()
      .single()
    if (orderError) throw orderError

    // Create order items
    const orderItems = items.map((item: {
      menu_item_id: number
      name: string
      price: number
      quantity: number
    }) => ({
      order_id: order.id,
      menu_item_id: item.menu_item_id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }))
    const { error: itemsError } = await db.from('order_items').insert(orderItems)
    if (itemsError) throw itemsError

    // Send to Clopos (non-blocking)
    try {
      const cloposId = await sendOrderToClopos(order, orderItems)
      if (cloposId) {
        await db.from('orders').update({ clopos_order_id: cloposId }).eq('id', order.id)
      }
    } catch {
      console.warn('Clopos send failed — continuing')
    }

    // Notify user via bot
    if (telegramId) {
      try {
        await sendOrderConfirmation(telegramId, order.id, total, orderType)
      } catch {
        console.warn('Failed to send order confirmation')
      }
    }

    // Notify admin
    try {
      await notifyAdminNewOrder(order.id, total, orderType, userName)
    } catch {
      console.warn('Failed to notify admin')
    }

    return NextResponse.json({ orderId: order.id, status: order.status })
  } catch (e: unknown) {
    console.error('Order creation error:', e)
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Internal error' },
      { status: 500 }
    )
  }
}
