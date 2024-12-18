import { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { FaEye, FaFile, FaTrash } from 'react-icons/fa'

import { Button } from '@/view/components/ui/button'
import { OrdersDetailsDialog } from './OrdersDetailsDialog'
import { DeleteOrderAction } from './DeleteOrderAction'

import { useMutateOnDeleteBrand } from '@/view/hooks/mutations/orders'
import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

import { type OrdersApi, apiName } from '@/api/exposes/orders-api'
import { type OrderWithCustomer } from '@/api/repositories/orders-repository'

interface OrdersTableProps {
  orders: OrderWithCustomer[]
}

const FORMATTER = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })

export function OrdersTable({ orders }: OrdersTableProps) {
  const { toast } = useToast()
  const { user } = useAuth()

  const { mutateAsync } = useMutateOnDeleteBrand()

  const [selectedOrderId, setSelectedOrderId] = useState<string>()
  const [isOrderDetailsDialogOpen, setIsOrderDetailsDialogOpen] = useState(false)
  const [isDeleteOrderDialogOpen, setIsDeleteOrderDialogOpen] = useState(false)

  async function handleSaveOrderFile(orderId: string) {
    if (!user) return

    const { data, err } = await (window as unknown as Record<typeof apiName, OrdersApi>).ordersApi.downloadFile({
      loggedUserId: user.id,
      orderId,
    })

    if (err) {
      toast({
        title: 'Houve um erro ao tentar gerar o arquivo. Tente novamente.',
        duration: 3000,
      })
      return
    }

    if (data?.is_canceled) return

    toast({
      title: 'Arquivo salvo com sucesso.',
      duration: 3000,
    })
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
          toast({
            title: 'Pedido removido com sucesso.',
            duration: 3000,
          })
        },
        onError: () => {
          toast({
            title: 'Houve um erro ao apagar o pedido. Tente novamente.',
            duration: 3000,
          })
        },
      },
    )

    setIsDeleteOrderDialogOpen(false)
    setSelectedOrderId(undefined)
  }

  return (
    <>
      <Table>
        {orders.length === 0 && <TableCaption>Nenhum pedido encontrado.</TableCaption>}

        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Preço do pedido</TableHead>
            <TableHead>Data do pedido</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {orders.map(({ id, customer, totalPrice, createdAt }) => (
            <TableRow key={id}>
              <TableCell>
                <p className="font-medium">{customer?.name ?? 'N/A'}</p>
              </TableCell>

              <TableCell>
                <p className="font-medium">{formatCurrency(parseCentsToDecimal(totalPrice ?? 0))}</p>
              </TableCell>

              <TableCell>
                <p className="font-medium">{FORMATTER.format(new Date(createdAt + ' UTC'))}</p>
              </TableCell>

              <TableCell className="flex-nowrap text-right space-x-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedOrderId(id)
                    setIsOrderDetailsDialogOpen(true)
                  }}
                >
                  <FaEye className="w-3 h-3" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    await handleSaveOrderFile(id)
                  }}
                >
                  <FaFile className="w-3 h-3" />
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const order = orders.find((item) => item.id === id)

                    if (order) {
                      handleRequestOrderDeletion(order.id)
                    }
                  }}
                >
                  <FaTrash className="w-3 h-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <OrdersDetailsDialog
        orderId={selectedOrderId}
        isOpen={isOrderDetailsDialogOpen}
        onClose={() => setIsOrderDetailsDialogOpen(false)}
      />

      <DeleteOrderAction
        onDelete={handleDeleteOrder}
        isOpen={isDeleteOrderDialogOpen}
        onClose={() => setIsDeleteOrderDialogOpen(false)}
      />
    </>
  )
}
