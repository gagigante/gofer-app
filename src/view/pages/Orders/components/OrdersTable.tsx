import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Eye, FileText, Trash2 } from 'lucide-react'

import { Tooltip, TooltipTrigger, TooltipContent } from '@/view/components/ui/tooltip'
import { TableActionButton } from '@/view/components/TableActionButton'
import { DeleteOrderAction } from './DeleteOrderAction'
import { TableLoading } from '@/view/components/TableLoading'

import { useMutateOnDeleteOrder } from '@/view/hooks/mutations/orders'
import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

import { type OrdersApi, apiName } from '@/api/exposes/orders-api'
import { type OrderWithCustomer } from '@/api/repositories/orders-repository'

interface OrdersTableProps {
  orders: OrderWithCustomer[]
  isLoading?: boolean
}

const FORMATTER = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })

export function OrdersTable({ orders, isLoading = false }: OrdersTableProps) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { user } = useAuth()

  const { mutateAsync } = useMutateOnDeleteOrder()

  const [selectedOrderId, setSelectedOrderId] = useState<string>()
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

  if (isLoading) {
    return <TableLoading columns={5} rows={5} />
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
            <TableHead className="min-w-[160px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="relative">
          {orders.map(({ id, customer, totalPrice, totalCostPrice, createdAt }) => (
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
