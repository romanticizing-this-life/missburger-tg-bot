'use client'

interface Column<T> {
  key: keyof T | string
  header: string
  render?: (row: T) => React.ReactNode
}

interface Props<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
}

export default function AdminTable<T>({ columns, data, keyField }: Props<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-brand-muted">
      <table className="w-full text-sm text-left">
        <thead className="bg-brand-card border-b border-brand-muted">
          <tr>
            {columns.map((col) => (
              <th key={String(col.key)} className="px-4 py-3 text-gray-400 font-semibold whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={String(row[keyField])}
              className="border-b border-brand-muted hover:bg-brand-card transition-colors"
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 whitespace-nowrap">
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[String(col.key)] ?? '')}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                Нет данных
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
