import { useState, useEffect } from 'react'
import { Loader2, Pencil, FileText, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/view/components/ui/tooltip'
import { TableActionButton } from '@/view/components/TableActionButton'
import { DeleteBudgetAction } from './DeleteBudgetAction'

import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'
import { useMutateOnDeleteOrder } from '@/view/hooks/mutations/orders'
import { useOrder } from '@/view/hooks/queries/orders'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

import { apiName, type OrdersApi } from '@/api/exposes/orders-api'
import { type OrderWithCustomer } from '@/api/repositories/orders-repository'

interface BudgetsTableProps {
  orders: OrderWithCustomer[]
  isLoading?: boolean
}

const FORMATTER = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })

export function BudgetsTable({ orders, isLoading = false }: BudgetsTableProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [selectedOrderId, setSelectedOrderId] = useState<string>()
  const [orderToDeleteId, setOrderToDeleteId] = useState<string>()
  const [isDeleteBudgetDialogOpen, setIsDeleteBudgetDialogOpen] = useState(false)

  const { mutateAsync } = useMutateOnDeleteOrder()

  const { data: order, isLoading: isOrderLoading } = useOrder(
    { loggedUserId: user?.id ?? '', orderId: selectedOrderId ?? '' },
    {
      staleTime: 0,
      enabled: !!selectedOrderId && !!user,
    },
  )

  useEffect(() => {
    if (order) {
      handleCreateOrderFromDraft()
    }
  }, [order])

  function handleCreateOrderFromDraft() {
    if (!order) return

    navigate('/home/orders/new', { state: { draft: true, draftData: order } })
  }

  function handleRequestBudgetDeletion(orderId: string) {
    setOrderToDeleteId(orderId)
    setIsDeleteBudgetDialogOpen(true)
  }

  async function handleDeleteBudget() {
    if (!orderToDeleteId || !user) return

    await mutateAsync(
      { loggedUserId: user.id, orderId: orderToDeleteId },
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

    setIsDeleteBudgetDialogOpen(false)
    setOrderToDeleteId(undefined)
  }

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

  return (
    <>
      <Table>
        {orders.length === 0 && !isLoading && <TableCaption>Nenhum orçamento encontrado.</TableCaption>}

        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead className="min-w-[138px]">Preço do orçamento</TableHead>
            <TableHead className="min-w-[208px]">Data do orçamento</TableHead>
            <TableHead className="min-w-[160px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="relative">
          {isLoading && (
            <>
              <div className="absolute top-0 right-0 bottom-0 left-0 ">
                <div className="h-full flex items-center justify-center backdrop-blur-md bg-muted/20 border border-muted/10 z-10">
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Buscando orçamentos...
                </div>
              </div>

              <TableRow>
                <TableCell colSpan={4}>
                  <div className="h-24"></div>
                </TableCell>
              </TableRow>
            </>
          )}

          {!isLoading &&
            orders.map(({ id, customer, totalPrice, createdAt }) => (
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
                  <p className="font-medium">{formatCurrency(parseCentsToDecimal(totalPrice ?? 0))}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{FORMATTER.format(new Date(createdAt + ' UTC'))}</p>
                </TableCell>

                <TableCell className="text-right space-x-1.5">
                  <TableActionButton
                    icon={<Pencil className="w-3 h-3" />}
                    variant="outline"
                    tooltip="Criar pedido a partir do rascunho ou editar orçamento"
                    customLoading={isOrderLoading}
                    onClick={() => {
                      setSelectedOrderId(id)
                    }}
                  />

                  <TableActionButton
                    icon={<FileText className="w-3 h-3" />}
                    variant="outline"
                    tooltip="Salvar arquivo do orçamento"
                    onClick={async () => await handleSaveOrderFile(id)}
                  />

                  <TableActionButton
                    icon={<Trash2 className="w-3 h-3" />}
                    variant="destructive"
                    tooltip="Apagar orçamento"
                    onClick={() => {
                      const order = orders.find((item) => item.id === id)

                      if (order) {
                        handleRequestBudgetDeletion(order.id)
                      }
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>

      <DeleteBudgetAction
        onDelete={handleDeleteBudget}
        isOpen={isDeleteBudgetDialogOpen}
        onClose={() => setIsDeleteBudgetDialogOpen(false)}
      />
    </>
  )
}
