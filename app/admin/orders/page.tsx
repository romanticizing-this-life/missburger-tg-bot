'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order } from '@/lib/types'
import OrderStatus from '@/components/OrderStatus'

const formatPrice = (uzs: number) => uzs.toLocaleString('ru-RU') + " so'm"

const ALL_STATUSES: Order['status'][] = [
  'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled',
]

const STATUS_LABELS: Record<Order['status'], string> = {
  pending: 'Ожидает',
  confirmed: 'Принят',
  preparing: 'Готовится',
  ready: 'Готов',
  delivered: 'Доставлен',
  cancelled: 'Отменён',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    const res = await fetch('/api/admin/orders')
    if (res.ok) {
      const data = await res.json()
      setOrders(data)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()

    const channel = supabase
      .channel('admin-orders')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, fetchOrders)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders' }, fetchOrders)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [fetchOrders])

  const updateStatus = async (orderId: number, status: Order['status']) => {
    await fetch(`/api/admin/orders`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status }),
    })
    fetchOrders()
  }

  return (
    <main className="px-4 py-4">
      <h1 className="text-xl font-bold mb-4">Заказы</h1>
      {loading && <div className="text-brand-orange animate-pulse">Загрузка...</div>}
      <div className="flex flex-col gap-3">
        {orders.map((order) => (
          <div key={order.id} className="bg-brand-card rounded-2xl p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold">#{order.id}</p>
                <p className="text-xs text-gray-400">
                  {new Date(order.created_at).toLocaleString('ru-RU')}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {order.order_type === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз'}
                </p>
                {order.delivery_address && (
                  <p className="text-xs text-gray-300 mt-0.5">{order.delivery_address}</p>
                )}
              </div>
              <span className="text-brand-orange font-bold">{formatPrice(order.total)}</span>
            </div>
            <OrderStatus status={order.status} />
            <div className="mt-3">
              <select
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value as Order['status'])}
                className="w-full bg-brand-muted text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-orange"
              >
                {ALL_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {!loading && orders.length === 0 && (
          <p className="text-gray-500 text-center mt-8">Нет заказов</p>
        )}
      </div>
    </main>
  )
}
