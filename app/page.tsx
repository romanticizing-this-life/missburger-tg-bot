'use client'

import { useMenu } from '@/hooks/useMenu'
import { useTelegramUser } from '@/hooks/useTelegramUser'
import MenuGrid from '@/components/MenuGrid'
import CartButton from '@/components/CartButton'
import Image from 'next/image'

export default function Home() {
  const { departments, categories, menuItems, loading, error } = useMenu()
  const { user } = useTelegramUser()

  return (
    <main>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-brand-card border-b border-brand-muted sticky top-0 z-20">
        <div className="relative w-9 h-9 flex-shrink-0">
          <Image src="/logo.png" alt="Miss Burger" fill className="object-contain rounded-lg" />
        </div>
        <div>
          <h1 className="text-base font-bold text-white leading-tight">Miss Burger</h1>
          <p className="text-xs text-gray-400">Намангандаги энг яхши бургерлар</p>
        </div>
        {user && (
          <div className="ml-auto text-xs text-gray-400 text-right">
            <p className="text-white font-medium">{user.first_name}</p>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="text-brand-orange text-lg animate-pulse">Загрузка меню...</div>
        </div>
      )}

      {error && (
        <div className="mx-4 mt-4 p-4 bg-red-900/30 border border-red-700 rounded-2xl text-red-400 text-sm">
          Ошибка загрузки меню: {error}
        </div>
      )}

      {!loading && !error && (
        <MenuGrid
          departments={departments}
          categories={categories}
          menuItems={menuItems}
        />
      )}

      <CartButton />
    </main>
  )
}
