import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminToken } from '@/lib/adminAuth'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/admin?error=missing_token', req.url))
  }

  const result = verifyAdminToken(token)
  if (!result) {
    return NextResponse.redirect(new URL('/admin?error=invalid_token', req.url))
  }

  const response = NextResponse.redirect(new URL('/admin', req.url))
  response.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 3600, // 1 hour, matches token expiry
    path: '/',
  })
  return response
}
