'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { useTelegramUser } from '@/hooks/useTelegramUser'
import { supabase } from '@/lib/supabase'
import type { Location } from '@/lib/types'

const formatPrice = (uzs: number) => uzs.toLocaleString('ru-RU') + " so'm"

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clear } = useCart()
  const { initData } = useTelegramUser()
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery')
  const [address, setAddress] = useState('')
  const [comment, setComment] = useState('')
  const [locationId, setLocationId] = useState<number | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase
      .from('locations')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setLocations(data)
          setLocationId(data[0].id)
        }
      })
  }, [])

  if (items.length === 0) {
    router.push('/')
    return null
  }

  const handleSubmit = async () => {
    if (orderType === 'delivery' && !address.trim()) {
      setError('Укажите адрес доставки')
      return
    }
    if (!locationId) {
      setError('Выберите филиал')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initData,
          orderType,
          locationId,
          deliveryAddress: orderType === 'delivery' ? address : null,
          comment,
          items: items.map((i) => ({
            menu_item_id: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          total: total(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Ошибка при создании заказа')
      clear()
      router.push(`/order/${data.orderId}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      <div className="flex items-center gap-3 px-4 py-3 bg-brand-card border-b border-brand-muted sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold">Оформление заказа</h1>
      </div>

      <div className="px-4 py-4 pb-36 flex flex-col gap-4">
        {/* Order type */}
        <div className="bg-brand-card rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-400 mb-3">Способ получения</p>
          <div className="grid grid-cols-2 gap-2">
            {(['delivery', 'pickup'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setOrderType(type)}
                className={`py-3 rounded-xl text-sm font-semibold transition-colors ${
                  orderType === type
                    ? 'bg-brand-red text-white'
                    : 'bg-brand-muted text-gray-300 hover:bg-gray-600'
                }`}
              >
                {type === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз'}
              </button>
            ))}
          </div>
        </div>

        {/* Address (delivery only) */}
        {orderType === 'delivery' && (
          <div className="bg-brand-card rounded-2xl p-4">
            <p className="text-sm font-semibold text-gray-400 mb-3">Адрес доставки</p>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Введите адрес доставки..."
              rows={3}
              className="w-full bg-brand-muted text-white rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-1 focus:ring-brand-orange placeholder:text-gray-500"
            />
          </div>
        )}

        {/* Branch selection */}
        <div className="bg-brand-card rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-400 mb-3">Филиал</p>
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setLocationId(loc.id)}
              className={`w-full text-left px-4 py-3 rounded-xl mb-2 text-sm transition-colors ${
                locationId === loc.id
                  ? 'bg-brand-red text-white'
                  : 'bg-brand-muted text-gray-300 hover:bg-gray-600'
              }`}
            >
              <p className="font-semibold">{loc.name}</p>
              <p className={`text-xs mt-0.5 ${locationId === loc.id ? 'text-red-200' : 'text-gray-500'}`}>
                {loc.address}
              </p>
            </button>
          ))}
        </div>

        {/* Comment */}
        <div className="bg-brand-card rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-400 mb-3">Комментарий к заказу</p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Без лука, дополнительный соус..."
            rows={2}
            className="w-full bg-brand-muted text-white rounded-xl px-4 py-3 text-sm resize-none outline-none focus:ring-1 focus:ring-brand-orange placeholder:text-gray-500"
          />
        </div>

        {/* Order summary */}
        <div className="bg-brand-card rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-400 mb-3">Ваш заказ</p>
          {items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm mb-2">
              <span className="text-gray-300">
                {item.name} × {item.quantity}
              </span>
              <span className="text-white font-medium">
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          ))}
          <div className="border-t border-brand-muted mt-3 pt-3 flex justify-between font-bold">
            <span>Итого</span>
            <span className="text-brand-orange">{formatPrice(total())}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Оплата при получении (наличные)</p>
        </div>

        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-2xl p-4 text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="fixed bottom-4 left-4 right-4">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-brand-red hover:bg-red-800 disabled:bg-gray-600 text-white rounded-2xl px-5 py-4 font-bold text-base transition-colors shadow-xl"
        >
          {loading ? 'Оформляем...' : `Подтвердить заказ — ${formatPrice(total())}`}
        </button>
      </div>
    </main>
  )
}
