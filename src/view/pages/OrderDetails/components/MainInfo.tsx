import { toast } from 'sonner'

import { BadgeSelect } from '@/view/components/BadgeSelect'
import { Label } from '@/view/components/ui/label'
import { Textarea } from '@/view/components/ui/textarea'

import { useAuth } from '@/view/hooks/useAuth'
import { useMutateOnUpdateOrderStatus } from '@/view/hooks/mutations/orders'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

import { ORDER_STATUS_OPTIONS } from '@/view/constants/ORDER_STATUS_OPTIONS'

import { type OrderStatus } from '@/api/types/order-status'

interface MainInfoProps {
  orderId: string
  customer: string
  totalCostPrice: number
  totalPrice: number
  obs: string
  createdAt: string | null
  status: OrderStatus
}

const FORMATTER = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })

export function MainInfo({ orderId, customer, totalCostPrice, totalPrice, createdAt, obs, status }: MainInfoProps) {
  const { user } = useAuth()

  const { mutateAsync: mutateOnUpdateOrderStatus } = useMutateOnUpdateOrderStatus()

  async function handleUpdateOrderStatus(orderId: string, status: OrderStatus) {
    if (!orderId || !user) return

    await mutateOnUpdateOrderStatus(
      { loggedUserId: user?.id ?? '', orderId, status },
      {
        onSuccess: () => {
          toast('Situação do pedido atualizada com sucesso.')
        },
        onError: () => {
          toast('Houve um erro ao atualizar a situação do pedido. Tente novamente.')
        },
      },
    )
  }

  return (
    <>
      <div className="mb-8 space-y-2">
        <p className="font-medium">
          <b>Cliente:</b> {customer}
        </p>
        <p className="font-medium">
          <b>Preço de custo total:</b> {formatCurrency(parseCentsToDecimal(totalCostPrice))}
        </p>
        <p className="font-medium">
          <b>Preço total:</b> {formatCurrency(parseCentsToDecimal(totalPrice))}
        </p>
        <p className="font-medium">
          <b>Data do pedido:</b> {createdAt ? FORMATTER.format(new Date(createdAt + ' UTC')) : 'N/A'}
        </p>

        <div className="flex items-center gap-2">
          <p className="font-medium">
            <b>Situação do pedido:</b>
          </p>
          <BadgeSelect
            options={ORDER_STATUS_OPTIONS}
            value={status}
            onChange={(status) => handleUpdateOrderStatus(orderId, status as OrderStatus)}
          />
        </div>
      </div>

      <div className="grid w-full gap-1.5 my-4">
        <Label htmlFor="obs">Observações</Label>
        <Textarea placeholder="Observações" id="obs" readOnly value={obs} />
      </div>
    </>
  )
}
