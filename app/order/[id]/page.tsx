'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import OrderStatus from '@/components/OrderStatus'
import type { Order, OrderItem } from '@/lib/types'

const formatPrice = (uzs: number) => uzs.toLocaleString('ru-RU') + " so'm"

type OrderWithItems = Order & { order_items: OrderItem[] }

export default function OrderPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`)
      if (!res.ok) throw new Error('Заказ не найден')
      const data = await res.json()
      setOrder(data)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrder()
    const interval = setInterval(fetchOrder, 15000)
    return () => clearInterval(interval)
  }, [id])

  return (
    <main className="min-h-screen">
      <div className="flex items-center gap-3 px-4 py-3 bg-brand-card border-b border-brand-muted sticky top-0 z-10">
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold">Заказ {id ? `#${id}` : ''}</h1>
      </div>

      <div className="px-4 py-4">
        {loading && (
          <div className="text-center text-brand-orange animate-pulse mt-10">Загрузка...</div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-2xl p-4 text-red-400 text-sm mt-4">
            {error}
          </div>
        )}

        {order && (
          <div className="flex flex-col gap-4">
            {/* Status */}
            <div className="bg-brand-card rounded-2xl p-4">
              <p className="text-sm text-gray-400 mb-3">Статус заказа</p>
              <OrderStatus status={order.status} />
            </div>

            {/* Order info */}
            <div className="bg-brand-card rounded-2xl p-4">
              <p className="text-sm text-gray-400 mb-3">Детали заказа</p>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Тип</span>
                <span>{order.order_type === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз'}</span>
              </div>
              {order.delivery_address && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Адрес</span>
                  <span className="text-right max-w-48">{order.delivery_address}</span>
                </div>
              )}
              {order.comment && (
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Комментарий</span>
                  <span className="text-right max-w-48">{order.comment}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="bg-brand-card rounded-2xl p-4">
              <p className="text-sm text-gray-400 mb-3">Состав заказа</p>
              {order.order_items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm mb-2">
                  <span className="text-gray-300">
                    {item.name} × {item.quantity}
                  </span>
                  <span>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t border-brand-muted mt-3 pt-3 flex justify-between font-bold">
                <span>Итого</span>
                <span className="text-brand-orange">{formatPrice(order.total)}</span>
              </div>
            </div>

            <button
              onClick={() => router.push('/')}
              className="bg-brand-red hover:bg-red-800 text-white rounded-2xl px-5 py-4 font-bold text-base transition-colors"
            >
              На главную
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
