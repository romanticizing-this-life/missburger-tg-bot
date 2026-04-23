'use client'

import { useEffect, useState } from 'react'
import type { TelegramUser } from '@/lib/types'

export type TelegramLocation = { latitude: number; longitude: number }

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string
        initDataUnsafe: {
          user?: TelegramUser
        }
        ready: () => void
        expand: () => void
        close: () => void
        MainButton: {
          text: string
          show: () => void
          hide: () => void
          onClick: (cb: () => void) => void
        }
        BackButton: {
          show: () => void
          hide: () => void
          onClick: (cb: () => void) => void
        }
        colorScheme: 'light' | 'dark'
        themeParams: Record<string, string>
        requestContact?: (callback: (isSent: boolean) => void) => void
        LocationManager?: {
          isInited: boolean
          isLocationAvailable: boolean
          init: (cb: () => void) => void
          getLocation: (cb: (loc: TelegramLocation | null) => void) => void
        }
      }
    }
  }
}

export function useTelegramUser() {
  const [user, setUser] = useState<TelegramUser | null>(null)
  const [initData, setInitData] = useState<string>('')

  useEffect(() => {
    const tg = window.Telegram?.WebApp
    if (tg) {
      tg.ready()
      tg.expand()
      const u = tg.initDataUnsafe?.user
      if (u) setUser(u)
      setInitData(tg.initData || '')
    }
  }, [])

  return { user, initData }
}
