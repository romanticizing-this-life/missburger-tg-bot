'use client'

import { useEffect, useState } from 'react'

const formatPrice = (uzs: number) => uzs.toLocaleString('ru-RU') + " so'm"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    todayOrders: 0,
    todayRevenue: 0,
    pendingOrders: 0,
  })

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/admin/orders?stats=1')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    }
    load()
  }, [])

  return (
    <main className="px-4 py-4">
      <h1 className="text-xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-brand-card rounded-2xl p-5">
          <p className="text-sm text-gray-400">Заказов сегодня</p>
          <p className="text-3xl font-bold text-white mt-1">{stats.todayOrders}</p>
        </div>
        <div className="bg-brand-card rounded-2xl p-5">
          <p className="text-sm text-gray-400">Выручка сегодня</p>
          <p className="text-3xl font-bold text-brand-orange mt-1">
            {formatPrice(stats.todayRevenue)}
          </p>
        </div>
        <div className="bg-brand-card rounded-2xl p-5">
          <p className="text-sm text-gray-400">Ожидают обработки</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.pendingOrders}</p>
        </div>
      </div>
    </main>
  )
}
