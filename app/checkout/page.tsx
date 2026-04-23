'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'
import { useTelegramUser } from '@/hooks/useTelegramUser'
import { supabase } from '@/lib/supabase'
import { haversineKm, BRANCHES, DELIVERY_RADIUS_KM } from '@/lib/geo'
import type { Location } from '@/lib/types'

const formatPrice = (uzs: number) => uzs.toLocaleString('ru-RU') + " so'm"

const DELIVERY_FREE_THRESHOLD = 100_000
const DELIVERY_FEE = 10_000

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total, clear } = useCart()
  const { initData } = useTelegramUser()
  const [orderType, setOrderType] = useState<'delivery' | 'pickup'>('delivery')
  const [address, setAddress] = useState('')
  const [comment, setComment] = useState('')
  const [locationId, setLocationId] = useState<number | null>(null)
  const [locations, setLocations] = useState<Location[]>([])
  const [phone, setPhone] = useState('')
  const [hasRequestContact, setHasRequestContact] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoWarning, setGeoWarning] = useState('')
  const [largOrderConfirmed, setLargeOrderConfirmed] = useState(false)

  useEffect(() => {
    setHasRequestContact(!!window.Telegram?.WebApp?.requestContact)
  }, [])

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

  const detectLocation = () => {
    setGeoLoading(true)
    setGeoWarning('')

    const onLocation = (lat: number, lng: number) => {
      // Find nearest branch and auto-select it
      let nearestId = locations[0]?.id ?? null
      let minDist = Infinity
      BRANCHES.forEach((branch) => {
        const dist = haversineKm(lat, lng, branch.lat, branch.lng)
        if (dist < minDist) { minDist = dist; nearestId = branch.id }
      })
      if (nearestId) setLocationId(nearestId)
      if (minDist > DELIVERY_RADIUS_KM) {
        setGeoWarning(`Вы в ${minDist.toFixed(1)} км от ближайшего филиала. Доставка может быть недоступна.`)
      }
      setGeoLoading(false)
    }

    const onError = () => {
      setGeoWarning('Не удалось определить местоположение')
      setGeoLoading(false)
    }

    const lm = window.Telegram?.WebApp?.LocationManager
    if (lm) {
      lm.init(() => {
        if (lm.isLocationAvailable) {
          lm.getLocation((loc) => {
            if (loc) onLocation(loc.latitude, loc.longitude)
            else onError()
          })
        } else onError()
      })
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => onLocation(pos.coords.latitude, pos.coords.longitude),
        onError,
        { timeout: 8000 }
      )
    } else {
      onError()
    }
  }

  if (items.length === 0) {
    router.push('/')
    return null
  }

  const cartTotal = total()
  const deliveryFee = orderType === 'delivery' && cartTotal < DELIVERY_FREE_THRESHOLD ? DELIVERY_FEE : 0
  const finalTotal = cartTotal + deliveryFee
  const amountUntilFree = DELIVERY_FREE_THRESHOLD - cartTotal
  const isLargeOrder = finalTotal >= 500_000

  const handleRequestContact = () => {
    window.Telegram?.WebApp?.requestContact?.((isSent) => {
      if (!isSent) return
      // Contact sent to bot; phone will be stored on next order update.
      // Attempt to pre-fill from initDataUnsafe if available.
    })
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
    if (phone && !/^\d{9}$/.test(phone)) {
      setError('Введите корректный номер телефона (9 цифр после +998)')
      return
    }
    // Large order confirmation gate
    if (isLargeOrder && !largOrderConfirmed) {
      setLargeOrderConfirmed(true)
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
          total: finalTotal,
          deliveryFee,
          phone: phone ? `+998${phone}` : null,
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

        {/* Phone number */}
        <div className="bg-brand-card rounded-2xl p-4">
          <p className="text-sm font-semibold text-gray-400 mb-3">Номер телефона</p>
          <div className="flex items-center gap-2">
            <span className="text-white text-sm font-medium bg-brand-muted px-3 py-3 rounded-xl flex-shrink-0">
              +998
            </span>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 9))}
              placeholder="91 234 56 78"
              className="flex-1 bg-brand-muted text-white rounded-xl px-4 py-3 text-sm outline-none focus:ring-1 focus:ring-brand-orange placeholder:text-gray-500"
            />
          </div>
          {hasRequestContact && (
            <button
              onClick={handleRequestContact}
              className="mt-2 w-full text-xs text-brand-orange hover:text-orange-400 transition-colors py-1"
            >
              Поделиться номером через Telegram
            </button>
          )}
        </div>

        {/* Free delivery nudge */}
        {orderType === 'delivery' && amountUntilFree > 0 && (
          <div className="bg-brand-orange/10 border border-brand-orange/30 rounded-2xl px-4 py-3 text-sm text-brand-orange">
            Добавьте ещё <span className="font-bold">{formatPrice(amountUntilFree)}</span> для бесплатной доставки
          </div>
        )}
        {orderType === 'delivery' && deliveryFee === 0 && (
          <div className="bg-green-900/20 border border-green-700/30 rounded-2xl px-4 py-3 text-sm text-green-400">
            Бесплатная доставка
          </div>
        )}

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
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-400">Филиал</p>
            {orderType === 'delivery' && (
              <button
                onClick={detectLocation}
                disabled={geoLoading}
                className="flex items-center gap-1.5 text-xs text-brand-orange hover:text-orange-400 transition-colors disabled:opacity-50"
              >
                <span>{geoLoading ? '...' : '📍'}</span>
                <span>{geoLoading ? 'Определяем...' : 'Определить'}</span>
              </button>
            )}
          </div>
          {geoWarning && (
            <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl px-3 py-2 text-xs text-yellow-400 mb-3">
              {geoWarning}
            </div>
          )}
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
          {orderType === 'delivery' && (
            <div className="flex justify-between text-sm mb-2 mt-1">
              <span className="text-gray-400">Доставка</span>
              <span className={deliveryFee === 0 ? 'text-green-400' : 'text-white'}>
                {deliveryFee === 0 ? 'Бесплатно' : formatPrice(deliveryFee)}
              </span>
            </div>
          )}
          <div className="border-t border-brand-muted mt-3 pt-3 flex justify-between font-bold">
            <span>Итого</span>
            <span className="text-brand-orange">{formatPrice(finalTotal)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Оплата при получении (наличные)</p>
        </div>

        {/* Large order confirmation */}
        {isLargeOrder && largOrderConfirmed && (
          <div className="bg-yellow-900/20 border border-yellow-600/40 rounded-2xl p-4">
            <p className="text-yellow-400 text-sm font-semibold mb-1">⚠️ Крупный заказ</p>
            <p className="text-yellow-300/80 text-xs">
              Сумма заказа {formatPrice(finalTotal)}. Убедитесь, что у вас есть сдача. Нажмите «Подтвердить» ещё раз.
            </p>
          </div>
        )}

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
          className={`w-full text-white rounded-2xl px-5 py-4 font-bold text-base transition-colors shadow-xl ${
            isLargeOrder && largOrderConfirmed
              ? 'bg-yellow-700 hover:bg-yellow-600 disabled:bg-gray-600'
              : 'bg-brand-red hover:bg-red-800 disabled:bg-gray-600'
          }`}
        >
          {loading
            ? 'Оформляем...'
            : isLargeOrder && !largOrderConfirmed
            ? `Подтвердить — ${formatPrice(finalTotal)}`
            : isLargeOrder && largOrderConfirmed
            ? `Да, подтвердить — ${formatPrice(finalTotal)}`
            : `Подтвердить заказ — ${formatPrice(finalTotal)}`}
        </button>
      </div>
    </main>
  )
}
