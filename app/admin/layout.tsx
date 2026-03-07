import { cookies } from 'next/headers'
import { verifyAdminToken } from '@/lib/adminAuth'
import AdminNav from '@/components/AdminNav'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const session = cookieStore.get('admin_session')
  const valid = session ? verifyAdminToken(session.value) : null

  if (!valid) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 text-center">
        <div className="text-5xl">🔒</div>
        <h2 className="text-xl font-bold">Доступ запрещён</h2>
        <p className="text-gray-400 text-sm max-w-xs">
          Отправьте команду <span className="text-brand-orange font-mono">/admin</span> боту,
          чтобы получить ссылку для входа.
        </p>
        <Link
          href="/"
          className="bg-brand-red hover:bg-red-800 text-white rounded-xl px-6 py-3 font-semibold transition-colors"
        >
          На главную
        </Link>
      </div>
    )
  }

  return (
    <div>
      <AdminNav />
      {children}
    </div>
  )
}
