'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { MenuItem, Category } from '@/lib/types'
import { getPlaceholder } from '@/lib/placeholders'

const formatPrice = (uzs: number) => uzs.toLocaleString('ru-RU') + " so'm"

async function compressToWebP(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new window.Image()
    img.onload = () => {
      const MAX = 800
      const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * ratio)
      canvas.height = Math.round(img.height * ratio)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Compression failed'))),
        'image/webp',
        0.85
      )
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}

export default function AdminMenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingPrice, setEditingPrice] = useState<number | null>(null)
  const [priceValue, setPriceValue] = useState('')
  const [uploading, setUploading] = useState<number | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [search, setSearch] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadTargetId = useRef<number | null>(null)

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

  const triggerUpload = (itemId: number) => {
    uploadTargetId.current = itemId
    setUploadError('')
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    const itemId = uploadTargetId.current
    if (!file || !itemId) return
    e.target.value = ''

    setUploading(itemId)
    setUploadError('')
    try {
      const blob = await compressToWebP(file)
      const form = new FormData()
      form.append('file', blob, 'photo.webp')
      form.append('itemId', String(itemId))
      const res = await fetch('/api/admin/menu/upload', { method: 'POST', body: form })
      if (!res.ok) throw new Error((await res.json()).error)
      await fetchData()
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Ошибка загрузки')
    } finally {
      setUploading(null)
    }
  }

  const getCategoryName = (catId: number) =>
    categories.find((c) => c.id === catId)?.name || `#${catId}`

  const filtered = search.trim()
    ? items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
    : items

  return (
    <main className="px-4 py-4 pb-20">
      <h1 className="text-xl font-bold mb-3">Управление меню</h1>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по названию..."
        className="w-full bg-brand-card border border-brand-muted text-white rounded-xl px-4 py-2.5 text-sm mb-4 outline-none focus:ring-1 focus:ring-brand-orange placeholder:text-gray-500"
      />

      {uploadError && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-2 text-red-400 text-sm mb-3">
          {uploadError}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {loading && <div className="text-brand-orange animate-pulse">Загрузка...</div>}

      <div className="flex flex-col gap-2">
        {filtered.map((item) => {
          const ph = getPlaceholder('')
          return (
            <div key={item.id} className="bg-brand-card rounded-2xl p-3 flex gap-3 items-start">
              {/* Photo thumbnail */}
              <button
                onClick={() => triggerUpload(item.id)}
                disabled={uploading === item.id}
                className="relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-brand-muted hover:opacity-80 transition-opacity"
                title="Загрузить фото"
              >
                {uploading === item.id ? (
                  <div className="w-full h-full flex items-center justify-center text-brand-orange text-xs animate-pulse">
                    ...
                  </div>
                ) : item.image_url ? (
                  <Image src={item.image_url} alt={item.name} fill className="object-cover" sizes="64px" />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center text-2xl"
                    style={{ background: `linear-gradient(135deg, ${ph.from}, ${ph.to})` }}
                  >
                    📷
                  </div>
                )}
                <div className="absolute inset-0 bg-black/30 flex items-end justify-center pb-1 opacity-0 hover:opacity-100 transition-opacity">
                  <span className="text-white text-[9px] font-semibold">ФОТО</span>
                </div>
              </button>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm leading-tight">{item.name}</p>
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
                    onClick={() => { setEditingPrice(item.id); setPriceValue(String(item.price)) }}
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
                {item.is_available ? 'Вкл' : 'Выкл'}
              </button>
            </div>
          )
        })}
        {!loading && filtered.length === 0 && (
          <p className="text-gray-500 text-center mt-8">Ничего не найдено</p>
        )}
      </div>
    </main>
  )
}
