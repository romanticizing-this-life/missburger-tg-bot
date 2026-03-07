'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'

const formatPrice = (uzs: number) => uzs.toLocaleString('ru-RU') + " so'm"

export default function CartPage() {
  const router = useRouter()
  const { items, updateQty, removeItem, total, count } = useCart()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-4 text-center">
        <div className="text-6xl">🛒</div>
        <h2 className="text-xl font-bold">Корзина пуста</h2>
        <p className="text-gray-400 text-sm">Добавьте блюда из меню</p>
        <button
          onClick={() => router.push('/')}
          className="bg-brand-red hover:bg-red-800 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
        >
          В меню
        </button>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-brand-card border-b border-brand-muted sticky top-0 z-10">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white text-xl">
          ←
        </button>
        <h1 className="text-lg font-bold">Корзина</h1>
        <span className="ml-auto text-sm text-gray-400">{count()} товар(а)</span>
      </div>

      <div className="px-4 py-4 pb-36">
        {items.map((item) => (
          <div
            key={item.id}
            className="bg-brand-card rounded-2xl p-4 mb-3 flex items-center gap-3"
          >
            <div className="relative w-16 h-16 flex-shrink-0 bg-brand-muted rounded-xl overflow-hidden">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🍔
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm leading-tight truncate">{item.name}</p>
              <p className="text-brand-orange text-sm font-bold mt-0.5">
                {formatPrice(item.price)}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => updateQty(item.id, item.quantity - 1)}
                className="bg-brand-muted hover:bg-gray-600 text-white rounded-lg w-8 h-8 flex items-center justify-center font-bold text-lg transition-colors"
              >
                −
              </button>
              <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
              <button
                onClick={() => updateQty(item.id, item.quantity + 1)}
                className="bg-brand-red hover:bg-red-800 text-white rounded-lg w-8 h-8 flex items-center justify-center font-bold text-lg transition-colors"
              >
                +
              </button>
            </div>
          </div>
        ))}

        {/* Total */}
        <div className="bg-brand-card rounded-2xl p-4 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Итого</span>
            <span className="text-xl font-bold text-brand-orange">{formatPrice(total())}</span>
          </div>
        </div>
      </div>

      {/* Checkout button */}
      <div className="fixed bottom-4 left-4 right-4">
        <button
          onClick={() => router.push('/checkout')}
          className="w-full bg-brand-red hover:bg-red-800 text-white rounded-2xl px-5 py-4 font-bold text-base transition-colors shadow-xl"
        >
          Оформить заказ — {formatPrice(total())}
        </button>
      </div>
    </main>
  )
}
