'use client'

import { useEffect, useState } from 'react'
import { formatHours } from '@/lib/hours'

type DeptRow = {
  id: number
  name: string
  icon: string
  open_time: string | null
  close_time: string | null
}

export default function AdminHoursPage() {
  const [depts, setDepts] = useState<DeptRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<number | null>(null)
  const [edits, setEdits] = useState<Record<number, { open: string; close: string; always: boolean }>>({})

  useEffect(() => {
    fetch('/api/admin/departments')
      .then((r) => r.json())
      .then((data: DeptRow[]) => {
        setDepts(data)
        const initial: typeof edits = {}
        data.forEach((d) => {
          initial[d.id] = {
            open: d.open_time ?? '',
            close: d.close_time ?? '',
            always: !d.open_time,
          }
        })
        setEdits(initial)
        setLoading(false)
      })
  }, [])

  const save = async (id: number) => {
    const e = edits[id]
    setSaving(id)
    await fetch('/api/admin/departments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        open_time: e.always ? null : e.open || null,
        close_time: e.always ? null : e.close || null,
      }),
    })
    setSaving(null)
    setDepts((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, open_time: e.always ? null : e.open || null, close_time: e.always ? null : e.close || null }
          : d
      )
    )
  }

  const set = (id: number, key: 'open' | 'close' | 'always', value: string | boolean) =>
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }))

  return (
    <main className="px-4 py-4 pb-20">
      <h1 className="text-xl font-bold mb-1">Часы работы</h1>
      <p className="text-xs text-gray-500 mb-5">Время указывается по Намангану (UTC+5). Закрытые разделы скрыты в меню.</p>
      {loading && <div className="text-brand-orange animate-pulse">Загрузка...</div>}
      <div className="flex flex-col gap-3">
        {depts.map((dept) => {
          const e = edits[dept.id]
          if (!e) return null
          return (
            <div key={dept.id} className="bg-brand-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{dept.icon}</span>
                  <span className="font-semibold">{dept.name}</span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatHours(dept.open_time, dept.close_time)}
                </span>
              </div>

              <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
                <div
                  onClick={() => set(dept.id, 'always', !e.always)}
                  className={`relative w-10 h-5 rounded-full transition-colors ${e.always ? 'bg-green-600' : 'bg-brand-muted'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${e.always ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-gray-300">Работает 24/7</span>
              </label>

              {!e.always && (
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Открытие</p>
                    <input
                      type="time"
                      value={e.open}
                      onChange={(ev) => set(dept.id, 'open', ev.target.value)}
                      className="w-full bg-brand-muted text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 mb-1">Закрытие</p>
                    <input
                      type="time"
                      value={e.close}
                      onChange={(ev) => set(dept.id, 'close', ev.target.value)}
                      className="w-full bg-brand-muted text-white rounded-xl px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={() => save(dept.id)}
                disabled={saving === dept.id}
                className="w-full bg-brand-red hover:bg-red-800 disabled:bg-gray-600 text-white rounded-xl py-2 text-sm font-semibold transition-colors"
              >
                {saving === dept.id ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          )
        })}
      </div>
    </main>
  )
}
