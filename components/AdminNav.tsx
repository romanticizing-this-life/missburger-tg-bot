'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/orders', label: 'Заказы' },
  { href: '/admin/menu', label: 'Меню' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-brand-card border-b border-brand-muted px-4 py-3 flex items-center gap-4">
      <span className="font-bold text-brand-orange mr-2">Admin</span>
      {NAV.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm transition-colors ${
            pathname === href ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'
          }`}
        >
          {label}
        </Link>
      ))}
    </nav>
  )
}
