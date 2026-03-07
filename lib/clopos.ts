import type { Order, OrderItem } from './types'

export async function sendOrderToClopos(
  order: Order,
  items: OrderItem[]
): Promise<string | null> {
  if (!process.env.CLOPOS_API_KEY || process.env.CLOPOS_API_KEY === 'pending') {
    console.warn('Clopos not configured — skipping')
    return null
  }
  // TODO: implement when API docs available
  // Return clopos_order_id or null
  console.log('Sending to Clopos:', order.id, items.length, 'items')
  return null
}
