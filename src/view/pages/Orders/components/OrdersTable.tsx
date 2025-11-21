import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { FileText, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'

import { Tooltip, TooltipTrigger, TooltipContent } from '@/view/components/ui/tooltip'
import { TableActionButton } from '@/view/components/TableActionButton'
import { DeleteOrderAction } from './DeleteOrderAction'
import { TableLoading } from '@/view/components/TableLoading'
import { BadgeSelect } from '@/view/components/BadgeSelect'

import { useMutateOnDeleteOrder, useMutateOnUpdateOrderStatus } from '@/view/hooks/mutations/orders'
import { useAuth } from '@/view/hooks/useAuth'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

import { ORDER_STATUS_OPTIONS } from '@/view/constants/ORDER_STATUS_OPTIONS'

import { type OrdersApi, apiName } from '@/api/exposes/orders-api'
import { type OrderWithCustomer } from '@/api/repositories/orders-repository'
import { type OrderStatus } from '@/api/types/order-status'

interface OrdersTableProps {
  orders: OrderWithCustomer[]
  isLoading?: boolean
}

const FORMATTER = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })

export function OrdersTable({ orders, isLoading = false }: OrdersTableProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { mutateAsync } = useMutateOnDeleteOrder()
  const { mutateAsync: mutateOnUpdateOrderStatus } = useMutateOnUpdateOrderStatus()

  const [selectedOrderId, setSelectedOrderId] = useState<string>()
  const [isDeleteOrderDialogOpen, setIsDeleteOrderDialogOpen] = useState(false)

  async function handleSaveOrderFile(orderId: string) {
    if (!user) return

    const { data, err } = await (window as unknown as Record<typeof apiName, OrdersApi>).ordersApi.downloadFile({
      loggedUserId: user.id,
      orderId,
    })

    if (err) {
      toast('Houve um erro ao tentar gerar o arquivo. Tente novamente.')
      return
    }

    if (data?.is_canceled) return

    toast('Arquivo salvo com sucesso.')
  }

  function handleRequestOrderDeletion(orderId: string) {
    setSelectedOrderId(orderId)
    setIsDeleteOrderDialogOpen(true)
  }

  async function handleDeleteOrder() {
    if (!selectedOrderId || !user) return

    await mutateAsync(
      { loggedUserId: user.id, orderId: selectedOrderId },
      {
        onSuccess: () => {
          toast('Pedido removido com sucesso.')
        },
        onError: () => {
          toast('Houve um erro ao apagar o pedido. Tente novamente.')
        },
      },
    )

    setIsDeleteOrderDialogOpen(false)
    setSelectedOrderId(undefined)
  }

  async function handleUpdateOrderStatus(orderId: string, status: OrderStatus) {
    if (!orderId || !user) return

    await mutateOnUpdateOrderStatus(
      { loggedUserId: user.id, orderId, status },
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

  if (isLoading) {
    return <TableLoading columns={6} rows={5} />
  }

  return (
    <>
      <Table>
        {orders.length === 0 && <TableCaption>Nenhum pedido encontrado.</TableCaption>}

        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead className="min-w-[138px]">Preço de custo do pedido</TableHead>
            <TableHead className="min-w-[138px]">Preço do pedido</TableHead>
            <TableHead className="min-w-[208px]">Data do pedido</TableHead>
            <TableHead className="min-w-[208px]">Situação do pedido</TableHead>
            <TableHead className="min-w-[160px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="relative">
          {orders.map(({ id, customer, totalPrice, totalCostPrice, status, createdAt }) => (
            <TableRow key={id}>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="font-medium line-clamp-1">{customer?.name ?? 'N/A'}</p>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>{customer?.name ?? 'N/A'}</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>

              <TableCell>
                <p className="font-medium">{formatCurrency(parseCentsToDecimal(totalCostPrice ?? 0))}</p>
              </TableCell>

              <TableCell>
                <p className="font-medium">{formatCurrency(parseCentsToDecimal(totalPrice ?? 0))}</p>
              </TableCell>

              <TableCell>
                <p className="font-medium">{FORMATTER.format(new Date(createdAt + ' UTC'))}</p>
              </TableCell>

              <TableCell>
                <BadgeSelect
                  options={ORDER_STATUS_OPTIONS}
                  value={status}
                  onChange={(status) => handleUpdateOrderStatus(id, status as OrderStatus)}
                />
              </TableCell>

              <TableCell className="text-right space-x-1.5">
                <TableActionButton
                  icon={<Eye className="w-3 h-3" />}
                  variant="outline"
                  tooltip="Ver detalhes do pedido"
                  onClick={() => {
                    navigate(`/home/orders/${id}`)
                  }}
                />

                <TableActionButton
                  icon={<FileText className="w-3 h-3" />}
                  variant="outline"
                  tooltip="Salvar arquivo do pedido"
                  onClick={async () => {
                    await handleSaveOrderFile(id)
                  }}
                />

                <TableActionButton
                  icon={<Trash2 className="w-3 h-3" />}
                  variant="destructive"
                  tooltip="Apagar pedido"
                  onClick={() => {
                    const order = orders.find((item) => item.id === id)

                    if (order) {
                      handleRequestOrderDeletion(order.id)
                    }
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <DeleteOrderAction
        onDelete={handleDeleteOrder}
        isOpen={isDeleteOrderDialogOpen}
        onClose={() => setIsDeleteOrderDialogOpen(false)}
      />
    </>
  )
}
