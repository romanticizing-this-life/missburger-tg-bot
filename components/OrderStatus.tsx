import type { Order } from '@/lib/types'

const STATUS_CONFIG: Record<
  Order['status'],
  { label: string; color: string; step: number }
> = {
  pending: { label: 'Ожидает', color: 'bg-yellow-500', step: 1 },
  confirmed: { label: 'Подтверждён', color: 'bg-blue-500', step: 2 },
  preparing: { label: 'Готовится', color: 'bg-orange-500', step: 3 },
  ready: { label: 'Готов', color: 'bg-green-500', step: 4 },
  delivered: { label: 'Доставлен', color: 'bg-green-700', step: 5 },
  cancelled: { label: 'Отменён', color: 'bg-red-600', step: 0 },
}

const STEPS = [
  { key: 'pending', label: 'Ожидает' },
  { key: 'confirmed', label: 'Принят' },
  { key: 'preparing', label: 'Готовится' },
  { key: 'ready', label: 'Готов' },
  { key: 'delivered', label: 'Доставлен' },
]

export default function OrderStatus({ status }: { status: Order['status'] }) {
  const config = STATUS_CONFIG[status]
  const currentStep = config.step

  if (status === 'cancelled') {
    return (
      <span className="inline-block bg-red-600 text-white text-sm font-semibold px-3 py-1.5 rounded-xl">
        Отменён
      </span>
    )
  }

  return (
    <div>
      <span
        className={`inline-block ${config.color} text-white text-sm font-semibold px-3 py-1.5 rounded-xl mb-4`}
      >
        {config.label}
      </span>
      <div className="flex items-center gap-1">
        {STEPS.map((step, idx) => (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-3 h-3 rounded-full ${
                  idx + 1 <= currentStep ? 'bg-brand-orange' : 'bg-brand-muted'
                }`}
              />
              <span className="text-xs text-gray-400 mt-1 text-center leading-tight">
                {step.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mb-4 ${
                  idx + 1 < currentStep ? 'bg-brand-orange' : 'bg-brand-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
