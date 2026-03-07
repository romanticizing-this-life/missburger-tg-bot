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

  const isProduction = process.env.NODE_ENV === 'production'

  // Return an HTML page that sets the cookie and then navigates.
  // This is more reliable than Set-Cookie on a 302 redirect in some
  // mobile/in-app browsers (including Telegram's WebView).
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Вход...</title></head>
<body style="background:#0F0F0F;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
<p>Входим в панель...</p>
<script>window.location.replace('/admin')</script>
</body>
</html>`

  const response = new NextResponse(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  })

  response.cookies.set('admin_session', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 3600,
    path: '/',
  })

  return response
}
