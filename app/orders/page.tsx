'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTelegramUser } from '@/hooks/useTelegramUser'
import { useCart } from '@/hooks/useCart'
import OrderStatus from '@/components/OrderStatus'
import type { Order, OrderItem, MenuItem } from '@/lib/types'

const formatPrice = (uzs: number) => uzs.toLocaleString('ru-RU') + " so'm"

type OrderWithItems = Order & { order_items: OrderItem[] }

export default function OrdersPage() {
  const router = useRouter()
  const { initData } = useTelegramUser()
  const { addItem, clear } = useCart()
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)
  const [repeating, setRepeating] = useState<number | null>(null)

  useEffect(() => {
    if (!initData) return
    fetch('/api/orders/history', {
      headers: { 'x-init-data': initData },
    })
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setOrders(data)
      })
      .finally(() => setLoading(false))
  }, [initData])

  const repeatOrder = async (order: OrderWithItems) => {
    setRepeating(order.id)
    clear()
    order.order_items.forEach((oi) => {
      const asMenuItem: MenuItem = {
        id: oi.menu_item_id,
        category_id: 0,
        name: oi.name,
        description: null,
        price: oi.price,
        image_url: null,
        is_available: true,
        sort_order: 0,
      }
      for (let i = 0; i < oi.quantity; i++) addItem(asMenuItem)
    })
    setRepeating(null)
    router.push('/cart')
  }

  return (
    <main className="min-h-screen">
      <div className="flex items-center gap-3 px-4 py-3 bg-brand-card border-b border-brand-muted sticky top-0 z-10">
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold">Мои заказы</h1>
      </div>

      <div className="px-4 py-4">
        {loading && (
          <div className="text-center text-brand-orange animate-pulse mt-10">Загрузка...</div>
        )}
        {!loading && orders.length === 0 && (
          <div className="text-center mt-16">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-400">У вас пока нет заказов</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 bg-brand-red hover:bg-red-800 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
            >
              Сделать заказ
            </button>
          </div>
        )}
        {orders.map((order) => (
          <div key={order.id} className="bg-brand-card rounded-2xl p-4 mb-3">
            <div
              className="flex justify-between items-start mb-3 cursor-pointer"
              onClick={() => router.push(`/order/${order.id}`)}
            >
              <div>
                <p className="font-bold">Заказ #{order.id}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {order.order_type === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз'}
                </p>
              </div>
              <span className="text-brand-orange font-bold text-sm">{formatPrice(order.total)}</span>
            </div>

            <OrderStatus status={order.status} />

            {order.order_items?.length > 0 && (
              <div className="mt-3 border-t border-brand-muted pt-3">
                <p className="text-xs text-gray-500 mb-1.5">Состав:</p>
                {order.order_items.slice(0, 3).map((oi) => (
                  <p key={oi.id} className="text-xs text-gray-300">
                    {oi.name} × {oi.quantity}
                  </p>
                ))}
                {order.order_items.length > 3 && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    + ещё {order.order_items.length - 3} позиции
                  </p>
                )}
              </div>
            )}

            <button
              onClick={() => repeatOrder(order)}
              disabled={repeating === order.id}
              className="mt-3 w-full bg-brand-muted hover:bg-gray-600 disabled:opacity-50 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors"
            >
              {repeating === order.id ? 'Добавляем...' : '🔁 Повторить заказ'}
            </button>
          </div>
        ))}
      </div>
    </main>
  )
}
