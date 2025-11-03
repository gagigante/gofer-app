import { CircleDashed, Loader, Check, CheckCheck, LucideIcon } from 'lucide-react'

import { type OrderStatus } from '@/api/types/order-status'

export const ORDER_STATUS_OPTIONS: Array<{
  label: string
  value: OrderStatus
  icon: LucideIcon
  className?: string
}> = [
  {
    label: 'Pendente',
    value: 'pending',
    icon: CircleDashed,
    className: 'text-gray-500',
  },
  {
    label: 'Em andamento',
    value: 'in_progress',
    icon: Loader,
    className: 'text-yellow-500',
  },
  {
    label: 'Finalizado',
    value: 'finished',
    icon: Check,
    className: 'text-blue-500',
  },
  {
    label: 'Entregue',
    value: 'delivered',
    icon: CheckCheck,
    className: 'text-green-500',
  },
] as const
