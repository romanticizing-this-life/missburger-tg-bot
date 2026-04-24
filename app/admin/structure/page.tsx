'use client'

import { useEffect, useState } from 'react'
import type { Department, Category } from '@/lib/types'

type CategoryWithDept = Category & { departments?: { id: number; name: string; slug: string } | null }

export default function AdminStructurePage() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [categories, setCategories] = useState<CategoryWithDept[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Dept editing
  const [editingDept, setEditingDept] = useState<number | null>(null)
  const [deptName, setDeptName] = useState('')
  const [deptIcon, setDeptIcon] = useState('')

  // Category editing
  const [editingCat, setEditingCat] = useState<number | null>(null)
  const [catName, setCatName] = useState('')
  const [catDeptId, setCatDeptId] = useState<number>(0)

  // New category
  const [newCatName, setNewCatName] = useState('')
  const [newCatDeptId, setNewCatDeptId] = useState<number>(0)
  const [addingCat, setAddingCat] = useState(false)

  // Active accordion dept
  const [openDept, setOpenDept] = useState<number | null>(null)

  const flash = (msg: string) => {
    setSuccess(msg)
    setTimeout(() => setSuccess(''), 2500)
  }

  const fetchAll = async () => {
    setLoading(true)
    const [dRes, cRes] = await Promise.all([
      fetch('/api/admin/departments'),
      fetch('/api/admin/categories'),
    ])
    if (dRes.ok) setDepartments(await dRes.json())
    if (cRes.ok) setCategories(await cRes.json())
    setLoading(false)
  }

  useEffect(() => { fetchAll() }, [])

  // ── Department actions ──────────────────────────────────────────
  const startEditDept = (d: Department) => {
    setEditingDept(d.id)
    setDeptName(d.name)
    setDeptIcon(d.icon)
  }

  const saveDept = async (id: number) => {
    setError('')
    const res = await fetch('/api/admin/departments', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: deptName.trim(), icon: deptIcon.trim() }),
    })
    if (res.ok) { setEditingDept(null); flash('Раздел обновлён'); fetchAll() }
    else setError((await res.json()).error)
  }

  // ── Category actions ────────────────────────────────────────────
  const startEditCat = (c: CategoryWithDept) => {
    setEditingCat(c.id)
    setCatName(c.name)
    setCatDeptId(c.department_id)
  }

  const saveCat = async (id: number) => {
    setError('')
    const res = await fetch('/api/admin/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: catName.trim(), department_id: catDeptId }),
    })
    if (res.ok) { setEditingCat(null); flash('Категория обновлена'); fetchAll() }
    else setError((await res.json()).error)
  }

  const deleteCat = async (id: number, name: string) => {
    if (!confirm(`Удалить категорию «${name}»? Это нельзя отменить.`)) return
    setError('')
    const res = await fetch('/api/admin/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) { flash('Категория удалена'); fetchAll() }
    else setError((await res.json()).error)
  }

  const addCategory = async () => {
    if (!newCatName.trim() || !newCatDeptId) return
    setAddingCat(true)
    setError('')
    const res = await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ department_id: newCatDeptId, name: newCatName.trim() }),
    })
    if (res.ok) {
      setNewCatName('')
      setNewCatDeptId(0)
      flash('Категория добавлена')
      fetchAll()
    } else setError((await res.json()).error)
    setAddingCat(false)
  }

  // ── Render ──────────────────────────────────────────────────────
  const getCatsForDept = (deptId: number) =>
    categories.filter((c) => c.department_id === deptId)

  if (loading) return <main className="px-4 py-6 text-brand-orange animate-pulse">Загрузка...</main>

  return (
    <main className="px-4 py-4 pb-20 max-w-2xl">
      <h1 className="text-xl font-bold mb-1">Структура меню</h1>
      <p className="text-xs text-gray-500 mb-4">Переименуйте разделы, категории и перемещайте их между разделами.</p>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-xl px-4 py-3 text-red-400 text-sm mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-900/30 border border-green-700 rounded-xl px-4 py-3 text-green-400 text-sm mb-4">
          ✓ {success}
        </div>
      )}

      {/* Add new category */}
      <div className="bg-brand-card rounded-2xl p-4 mb-4">
        <p className="text-sm font-semibold text-gray-400 mb-3">Добавить категорию</p>
        <div className="flex gap-2">
          <select
            value={newCatDeptId}
            onChange={(e) => setNewCatDeptId(Number(e.target.value))}
            className="bg-brand-muted text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-orange flex-shrink-0"
          >
            <option value={0}>Раздел...</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
            ))}
          </select>
          <input
            type="text"
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="Название категории"
            className="flex-1 bg-brand-muted text-white rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-1 focus:ring-brand-orange placeholder:text-gray-500"
            onKeyDown={(e) => e.key === 'Enter' && addCategory()}
          />
          <button
            onClick={addCategory}
            disabled={addingCat || !newCatName.trim() || !newCatDeptId}
            className="bg-brand-red hover:bg-red-800 disabled:bg-gray-700 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors flex-shrink-0"
          >
            + Добавить
          </button>
        </div>
      </div>

      {/* Departments accordion */}
      <div className="flex flex-col gap-3">
        {departments.map((dept) => {
          const cats = getCatsForDept(dept.id)
          const isOpen = openDept === dept.id

          return (
            <div key={dept.id} className="bg-brand-card rounded-2xl overflow-hidden">
              {/* Department header */}
              <div className="flex items-center gap-2 px-4 py-3">
                {editingDept === dept.id ? (
                  <>
                    <input
                      type="text"
                      value={deptIcon}
                      onChange={(e) => setDeptIcon(e.target.value)}
                      placeholder="🍔"
                      className="w-12 bg-brand-muted text-white rounded-lg px-2 py-1.5 text-center text-sm outline-none focus:ring-1 focus:ring-brand-orange"
                    />
                    <input
                      type="text"
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      className="flex-1 bg-brand-muted text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-brand-orange"
                      autoFocus
                      onKeyDown={(e) => e.key === 'Enter' && saveDept(dept.id)}
                    />
                    <button
                      onClick={() => saveDept(dept.id)}
                      className="bg-green-700 hover:bg-green-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
                    >✓</button>
                    <button
                      onClick={() => setEditingDept(null)}
                      className="bg-brand-muted hover:bg-gray-600 text-white rounded-lg px-3 py-1.5 text-xs transition-colors"
                    >✕</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setOpenDept(isOpen ? null : dept.id)}
                      className="flex-1 flex items-center gap-2 text-left"
                    >
                      <span className="text-xl">{dept.icon}</span>
                      <div>
                        <p className="font-semibold text-sm">{dept.name}</p>
                        <p className="text-xs text-gray-500">{cats.length} категорий</p>
                      </div>
                      <span className="ml-auto text-gray-500 text-xs">{isOpen ? '▲' : '▼'}</span>
                    </button>
                    <button
                      onClick={() => startEditDept(dept)}
                      className="text-xs text-gray-400 hover:text-brand-orange px-2 py-1 transition-colors"
                    >
                      ✏️
                    </button>
                  </>
                )}
              </div>

              {/* Categories list */}
              {isOpen && (
                <div className="border-t border-brand-muted">
                  {cats.length === 0 && (
                    <p className="text-xs text-gray-600 px-4 py-3">Нет категорий</p>
                  )}
                  {cats.map((cat) => (
                    <div key={cat.id} className="flex items-center gap-2 px-4 py-2.5 border-b border-brand-muted/50 last:border-0">
                      {editingCat === cat.id ? (
                        <>
                          <input
                            type="text"
                            value={catName}
                            onChange={(e) => setCatName(e.target.value)}
                            className="flex-1 bg-brand-muted text-white rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-1 focus:ring-brand-orange"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && saveCat(cat.id)}
                          />
                          <select
                            value={catDeptId}
                            onChange={(e) => setCatDeptId(Number(e.target.value))}
                            className="bg-brand-muted text-white rounded-lg px-2 py-1.5 text-xs outline-none focus:ring-1 focus:ring-brand-orange"
                          >
                            {departments.map((d) => (
                              <option key={d.id} value={d.id}>{d.icon} {d.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => saveCat(cat.id)}
                            className="bg-green-700 hover:bg-green-600 text-white rounded-lg px-3 py-1.5 text-xs font-bold transition-colors"
                          >✓</button>
                          <button
                            onClick={() => setEditingCat(null)}
                            className="bg-brand-muted hover:bg-gray-600 text-white rounded-lg px-2 py-1.5 text-xs transition-colors"
                          >✕</button>
                        </>
                      ) : (
                        <>
                          <span className="flex-1 text-sm text-gray-200">{cat.name}</span>
                          <button
                            onClick={() => startEditCat(cat)}
                            className="text-xs text-gray-500 hover:text-brand-orange px-1.5 py-1 transition-colors"
                          >✏️</button>
                          <button
                            onClick={() => deleteCat(cat.id, cat.name)}
                            className="text-xs text-gray-600 hover:text-red-400 px-1.5 py-1 transition-colors"
                          >🗑</button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
