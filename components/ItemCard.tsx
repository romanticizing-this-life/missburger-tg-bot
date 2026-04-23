'use client'

import Image from 'next/image'
import type { MenuItem } from '@/lib/types'
import { useCart } from '@/hooks/useCart'
import { getPlaceholder } from '@/lib/placeholders'

const formatPrice = (uzs: number) => uzs.toLocaleString('ru-RU') + " so'm"

interface Props {
  item: MenuItem
  departmentSlug?: string
}

export default function ItemCard({ item, departmentSlug = '' }: Props) {
  const { addItem, items, updateQty } = useCart()
  const cartItem = items.find((i) => i.id === item.id)
  const qty = cartItem?.quantity ?? 0
  const ph = getPlaceholder(departmentSlug)

  return (
    <div className="bg-brand-card rounded-2xl overflow-hidden flex flex-col shadow-md">
      <div className="relative w-full h-36">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-5xl"
            style={{ background: `linear-gradient(135deg, ${ph.from}, ${ph.to})` }}
          >
            {ph.emoji}
          </div>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-sm font-semibold leading-tight mb-1">{item.name}</p>
        {item.description && (
          <p className="text-xs text-gray-400 mb-2 leading-tight line-clamp-2">
            {item.description}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-brand-orange font-bold text-sm">{formatPrice(item.price)}</span>
          {qty === 0 ? (
            <button
              onClick={() => addItem(item)}
              className="bg-brand-red hover:bg-red-800 text-white rounded-xl px-3 py-1.5 text-sm font-semibold transition-colors"
            >
              +
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => updateQty(item.id, qty - 1)}
                className="bg-brand-muted hover:bg-gray-600 text-white rounded-lg w-7 h-7 flex items-center justify-center font-bold text-lg transition-colors"
              >
                −
              </button>
              <span className="text-sm font-semibold w-4 text-center">{qty}</span>
              <button
                onClick={() => addItem(item)}
                className="bg-brand-red hover:bg-red-800 text-white rounded-lg w-7 h-7 flex items-center justify-center font-bold text-lg transition-colors"
              >
                +
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
