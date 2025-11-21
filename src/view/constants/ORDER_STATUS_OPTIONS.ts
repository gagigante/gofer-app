import { CircleDashed, Loader, Check, CheckCheck, LucideIcon, CircleMinus } from 'lucide-react'

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
    className: 'text-muted-foreground',
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
  {
    label: 'N/A',
    value: 'not_applied',
    icon: CircleMinus,
    className: 'text-purple-500',
  },
] as const
