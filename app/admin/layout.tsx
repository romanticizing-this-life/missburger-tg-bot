'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTelegramUser } from '@/hooks/useTelegramUser'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user } = useTelegramUser()
  const [authorized, setAuthorized] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Give Telegram time to initialize
    const timer = setTimeout(() => {
      if (user) {
        const adminId = process.env.NEXT_PUBLIC_ADMIN_TELEGRAM_ID
        if (adminId && user.id.toString() === adminId) {
          setAuthorized(true)
        }
      }
      setChecking(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [user])

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-brand-orange animate-pulse">Проверка доступа...</div>
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4 px-4 text-center">
        <div className="text-4xl">🔒</div>
        <h2 className="text-xl font-bold">Доступ запрещён</h2>
        <p className="text-gray-400 text-sm">У вас нет прав для просмотра этой страницы</p>
        <button
          onClick={() => router.push('/')}
          className="bg-brand-red hover:bg-red-800 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
        >
          На главную
        </button>
      </div>
    )
  }

  return (
    <div>
      <nav className="bg-brand-card border-b border-brand-muted px-4 py-3 flex items-center gap-4">
        <span className="font-bold text-brand-orange">Admin</span>
        <button
          onClick={() => router.push('/admin')}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Dashboard
        </button>
        <button
          onClick={() => router.push('/admin/orders')}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Заказы
        </button>
        <button
          onClick={() => router.push('/admin/menu')}
          className="text-sm text-gray-400 hover:text-white transition-colors"
        >
          Меню
        </button>
      </nav>
      {children}
    </div>
  )
}
