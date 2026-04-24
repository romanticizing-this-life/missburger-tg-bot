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
  const [activeCat, setActiveCat] = useState<number | null>(null) // null = "Все"
  const chipsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (departments.length > 0 && activeDept === null) {
      setActiveDept(departments[0].id)
    }
  }, [departments, activeDept])

  const switchDept = (deptId: number) => {
    setActiveDept(deptId)
    setActiveCat(null) // reset to "Все" whenever department changes
    chipsRef.current?.scrollTo({ left: 0, behavior: 'smooth' })
  }

  const activeDeptSlug = departments.find((d) => d.id === activeDept)?.slug ?? ''
  const deptCategories = categories.filter((c) => c.department_id === activeDept)
  const showChips = deptCategories.length > 1

  const visibleItems = menuItems.filter((m) => {
    const catInDept = deptCategories.some((c) => c.id === m.category_id)
    if (!catInDept) return false
    if (activeCat !== null) return m.category_id === activeCat
    return true
  })

  return (
    <div>
      {/* Department tabs */}
      <div className="sticky top-[60px] z-10 bg-brand-dark border-b border-brand-muted">
        <div className="flex overflow-x-auto scrollbar-hide px-4 gap-1 py-2">
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => switchDept(dept.id)}
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

        {/* Category chips — only shown when dept has >1 categories */}
        {showChips && (
          <div
            ref={chipsRef}
            className="flex overflow-x-auto scrollbar-hide px-4 gap-2 pb-2.5"
          >
            {/* "Все" chip */}
            <button
              onClick={() => setActiveCat(null)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                activeCat === null
                  ? 'bg-brand-orange text-white'
                  : 'bg-brand-muted text-gray-300 hover:bg-gray-600'
              }`}
            >
              Все
            </button>

            {deptCategories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCat(cat.id)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeCat === cat.id
                    ? 'bg-brand-orange text-white'
                    : 'bg-brand-muted text-gray-300 hover:bg-gray-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Menu items */}
      <div className="px-4 pb-32">
        {activeCat === null ? (
          // "Все" mode — group by category with section headers
          deptCategories.map((cat) => {
            const items = visibleItems.filter((m) => m.category_id === cat.id)
            if (items.length === 0) return null
            return (
              <div key={cat.id} className="mt-4">
                {showChips && (
                  <h2 className="text-sm font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                    {cat.name}
                  </h2>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {items.map((item) => (
                    <ItemCard key={item.id} item={item} departmentSlug={activeDeptSlug} />
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          // Single category chip selected — flat grid, no header
          <div className="mt-4 grid grid-cols-2 gap-3">
            {visibleItems.map((item) => (
              <ItemCard key={item.id} item={item} departmentSlug={activeDeptSlug} />
            ))}
          </div>
        )}

        {visibleItems.length === 0 && (
          <div className="text-center text-gray-500 mt-10 text-sm">
            В этом разделе пока нет блюд
          </div>
        )}
      </div>
    </div>
  )
}
