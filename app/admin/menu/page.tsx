'use client'

import { useEffect, useState } from 'react'
import type { MenuItem, Category } from '@/lib/types'

const formatPrice = (uzs: number) => uzs.toLocaleString('ru-RU') + " so'm"

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPrice, setEditingPrice] = useState<number | null>(null)
  const [priceValue, setPriceValue] = useState('')

  const fetchData = async () => {
    const [itemsRes, catsRes] = await Promise.all([
      fetch('/api/admin/menu'),
      fetch('/api/admin/menu?type=categories'),
    ])
    if (itemsRes.ok) setItems(await itemsRes.json())
    if (catsRes.ok) setCategories(await catsRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const toggleAvailability = async (item: MenuItem) => {
    await fetch('/api/admin/menu', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: item.id, is_available: !item.is_available }),
    })
    fetchData()
  }

  const savePrice = async (id: number) => {
    const price = parseInt(priceValue.replace(/\s/g, ''), 10)
    if (!isNaN(price) && price > 0) {
      await fetch('/api/admin/menu', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, price }),
      })
    }
    setEditingPrice(null)
    fetchData()
  }

  const getCategoryName = (catId: number) =>
    categories.find((c) => c.id === catId)?.name || `#${catId}`

  return (
    <main className="px-4 py-4 pb-20">
      <h1 className="text-xl font-bold mb-4">Управление меню</h1>
      {loading && <div className="text-brand-orange animate-pulse">Загрузка...</div>}
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <div key={item.id} className="bg-brand-card rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{item.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{getCategoryName(item.category_id)}</p>
                {editingPrice === item.id ? (
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="number"
                      value={priceValue}
                      onChange={(e) => setPriceValue(e.target.value)}
                      className="bg-brand-muted text-white rounded-lg px-3 py-1.5 text-sm w-32 outline-none focus:ring-1 focus:ring-brand-orange"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && savePrice(item.id)}
                    />
                    <button
                      onClick={() => savePrice(item.id)}
                      className="bg-green-700 hover:bg-green-600 text-white rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingPrice(null)}
                      className="bg-brand-muted hover:bg-gray-600 text-white rounded-lg px-3 py-1.5 text-xs transition-colors"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingPrice(item.id)
                      setPriceValue(String(item.price))
                    }}
                    className="text-brand-orange text-sm font-bold mt-1 hover:underline"
                  >
                    {formatPrice(item.price)}
                  </button>
                )}
              </div>
              <button
                onClick={() => toggleAvailability(item)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  item.is_available
                    ? 'bg-green-800 text-green-300 hover:bg-green-700'
                    : 'bg-red-900 text-red-300 hover:bg-red-800'
                }`}
              >
                {item.is_available ? 'Доступен' : 'Скрыт'}
              </button>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && (
          <p className="text-gray-500 text-center mt-8">Нет позиций в меню</p>
        )}
      </div>
    </main>
  )
}
