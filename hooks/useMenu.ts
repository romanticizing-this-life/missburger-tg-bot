'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { isDepartmentOpen } from '@/lib/hours'
import type { Department, Category, MenuItem } from '@/lib/types'

export function useMenu() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [closedDeptIds, setClosedDeptIds] = useState<Set<number>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const [depsRes, catsRes, itemsRes] = await Promise.all([
          supabase.from('departments').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('categories').select('*').eq('is_active', true).order('sort_order'),
          supabase.from('menu_items').select('*').eq('is_available', true).order('sort_order'),
        ])
        if (depsRes.error) throw depsRes.error
        if (catsRes.error) throw catsRes.error
        if (itemsRes.error) throw itemsRes.error

        const allDepts: Department[] = depsRes.data || []
        const closed = new Set(
          allDepts
            .filter((d) => !isDepartmentOpen(d.open_time, d.close_time))
            .map((d) => d.id)
        )

        setDepartments(allDepts)
        setClosedDeptIds(closed)
        setCategories(catsRes.data || [])
        setMenuItems(itemsRes.data || [])
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load menu')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return { departments, categories, menuItems, closedDeptIds, loading, error }
}
