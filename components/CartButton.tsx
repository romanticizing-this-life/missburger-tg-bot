'use client'

import { useRouter } from 'next/navigation'
import { useCart } from '@/hooks/useCart'

const formatPrice = (uzs: number) => uzs.toLocaleString('ru-RU') + " so'm"

export default function CartButton() {
  const router = useRouter()
  const { count, total, items } = useCart()
  const itemCount = count()
  const cartTotal = total()

  if (itemCount === 0) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <button
        onClick={() => router.push('/cart')}
        className="w-full bg-brand-red hover:bg-red-800 text-white rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl transition-colors"
      >
        <span className="bg-red-800 text-white text-sm font-bold rounded-xl px-2.5 py-1">
          {itemCount}
        </span>
        <span className="font-bold text-base">Корзина</span>
        <span className="font-semibold text-sm">{formatPrice(cartTotal)}</span>
      </button>
    </div>
  )
}
