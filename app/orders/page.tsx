'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTelegramUser } from '@/hooks/useTelegramUser'
import { supabase } from '@/lib/supabase'
import OrderStatus from '@/components/OrderStatus'
import type { Order } from '@/lib/types'

const formatPrice = (uzs: number) => uzs.toLocaleString('ru-RU') + " so'm"

export default function OrdersPage() {
  const router = useRouter()
  const { user } = useTelegramUser()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    const currentUser = user
    async function load() {
      try {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('telegram_id', currentUser.id)
          .single()
        if (!userData) return
        const { data } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', userData.id)
          .order('created_at', { ascending: false })
          .limit(20)
        setOrders(data || [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

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
          <div
            key={order.id}
            onClick={() => router.push(`/order/${order.id}`)}
            className="bg-brand-card rounded-2xl p-4 mb-3 cursor-pointer hover:bg-brand-muted transition-colors"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold">Заказ #{order.id}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.created_at).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              <span className="text-brand-orange font-bold text-sm">{formatPrice(order.total)}</span>
            </div>
            <OrderStatus status={order.status} />
          </div>
        ))}
      </div>
    </main>
  )
}
