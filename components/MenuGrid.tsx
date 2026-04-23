'use client'

import { useState, useEffect, useRef } from 'react'
import type { Department, Category, MenuItem } from '@/lib/types'
import ItemCard from './ItemCard'

interface Props {
  departments: Department[]
  categories: Category[]
  menuItems: MenuItem[]
  closedDeptIds?: Set<number>
}

export default function MenuGrid({ departments, categories, menuItems, closedDeptIds }: Props) {
  const [activeDept, setActiveDept] = useState<number | null>(null)

  useEffect(() => {
    if (departments.length > 0 && activeDept === null) {
      setActiveDept(departments[0].id)
    }
  }, [departments, activeDept])

  const activeDeptSlug = departments.find((d) => d.id === activeDept)?.slug ?? ''

  const filteredCategories = categories.filter(
    (c) => c.department_id === activeDept
  )

  return (
    <div>
      {/* Department tabs */}
      <div className="sticky top-0 z-10 bg-brand-dark border-b border-brand-muted">
        <div className="flex overflow-x-auto scrollbar-hide px-4 gap-1 py-2">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setActiveDept(dept.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap ${
                activeDept === dept.id
                  ? 'border-b-2 border-brand-orange text-brand-orange bg-brand-card'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span>{dept.icon}</span>
              <span>{dept.name}</span>
              {closedDeptIds?.has(dept.id) && (
                <span className="text-xs text-gray-600 font-normal ml-0.5">· закрыто</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Menu items by category */}
      <div className="px-4 pb-32">
        {filteredCategories.map((cat) => {
          const items = menuItems.filter((m) => m.category_id === cat.id)
          if (items.length === 0) return null
          return (
            <div key={cat.id} className="mt-4">
              <h2 className="text-base font-bold mb-3 text-white">{cat.name}</h2>
              <div className="grid grid-cols-2 gap-3">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} departmentSlug={activeDeptSlug} />
                ))}
              </div>
            </div>
          )
        })}
        {filteredCategories.length === 0 && (
          <div className="text-center text-gray-500 mt-10 text-sm">
            В этом разделе пока нет блюд
          </div>
        )}
      </div>
    </div>
  )
}
