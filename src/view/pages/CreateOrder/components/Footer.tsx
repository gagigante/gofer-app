import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Link, useNavigate, type NavigateOptions } from 'react-router-dom'
import { useFormContext } from 'react-hook-form'

import { Button } from '@/view/components/ui/button'

import { useMutateOnCreateOrder, useMutateOnDeleteOrder } from '@/view/hooks/mutations/orders'
import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'
import { CreateOrderSchema } from '../schema'

import { apiName, type OrdersApi } from '@/api/exposes/orders-api'

interface FooterProps {
  draftOrderId?: string
  orderTotal: number
  orderCostPrice: number
  origin: 'order' | 'budget'
}

export function Footer({ draftOrderId, orderTotal, orderCostPrice, origin }: FooterProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const [actionType, setActionType] = useState<'order' | 'budget'>('order')

  const form = useFormContext<CreateOrderSchema>()

  const { mutateAsync: mutateOnCreateOrder, status: createOrderStatus } = useMutateOnCreateOrder()
  const { mutateAsync: mutateOnDeleteOrder, status: deleteOrderStatus } = useMutateOnDeleteOrder()

  const hasDraft = !!draftOrderId

  async function handleCreate(
    data: CreateOrderSchema,
    isDraft: boolean,
    successMessage: string,
    errorMessage: string,
    navigateOptions: { to: string; options?: NavigateOptions },
  ) {
    if (!user) return

    setActionType(isDraft ? 'budget' : 'order')

    if (hasDraft) {
      try {
        await mutateOnDeleteOrder({
          loggedUserId: user.id,
          orderId: draftOrderId,
        })
      } catch (error) {
        if (error instanceof Error && error.message === 'NotFoundError') {
          // Continue execution since NotFoundError is tolerable
        } else {
          toast({
            title: errorMessage,
            duration: 3000,
          })
          return
        }
      }
    }

    mutateOnCreateOrder(
      {
        loggedUserId: user.id,
        products: data.products.map(({ id, quantity, customPrice, obs }) => ({
          id,
          quantity,
          customProductPrice: customPrice,
          obs,
        })),
        customerId: data.customer?.id,
        obs: data.obs,
        city: data.city,
        complement: data.complement,
        neighborhood: data.neighborhood,
        street: data.street,
        zipcode: data.zipcode,
        draft: isDraft,
      },
      {
        onError: () => {
          toast({
            title: errorMessage,
            duration: 3000,
          })
        },
        onSuccess: async (response) => {
          if (!response) return

          toast({
            title: successMessage,
            duration: 3000,
          })

          navigate(navigateOptions.to, navigateOptions.options)

          await handleDownloadFile(response.id)
        },
      },
    )
  }

  async function handleCreateOrder(data: CreateOrderSchema) {
    await handleCreate(
      data,
      false,
      'Pedido criado com sucesso.',
      'Algo deu errado ao tentar criar o pedido. Tente novamente.',
      { to: '..', options: { relative: 'path' } },
    )
  }

  async function handleCreateBudget(data: CreateOrderSchema) {
    await handleCreate(
      data,
      true,
      'Orçamento criado com sucesso.',
      'Algo deu errado ao tentar criar o orçamento. Tente novamente.',
      { to: '/home/budgets' },
    )
  }

  async function handleDownloadFile(orderId: string) {
    if (!user) return

    const { err } = await (window as unknown as Record<typeof apiName, OrdersApi>).ordersApi.generateFile({
      loggedUserId: user.id,
      orderId,
    })

    if (err) {
      toast({
        title: 'Algo deu errado ao tentar baixar o arquivo. Acesse o arquivo na listagem de pedidos.',
        duration: 3000,
      })
    }
  }

  const products = form.watch('products')

  return (
    <footer className="flex items-center px-3 py-4 border-t border-border">
      <p>
        <strong>Total a pagar: </strong>
        {formatCurrency(parseCentsToDecimal(orderTotal))}
      </p>

      <p className="ml-4">
        <strong>Total preço de custo: </strong>
        {formatCurrency(parseCentsToDecimal(orderCostPrice))}
      </p>

      <div className="flex gap-2 ml-auto">
        <Button
          onClick={form.handleSubmit(handleCreateOrder)}
          disabled={products.length === 0 || createOrderStatus === 'pending' || deleteOrderStatus === 'pending'}
        >
          {(createOrderStatus === 'pending' || deleteOrderStatus === 'pending') && actionType === 'order' && (
            <Loader2 className="animate-spin w-4 h-4 mr-2" />
          )}
          Criar pedido
        </Button>

        <Button
          variant="outline"
          onClick={form.handleSubmit(handleCreateBudget)}
          disabled={products.length === 0 || createOrderStatus === 'pending' || deleteOrderStatus === 'pending'}
        >
          {(createOrderStatus === 'pending' || deleteOrderStatus === 'pending') && actionType === 'budget' && (
            <Loader2 className="animate-spin w-4 h-4 mr-2" />
          )}
          {hasDraft ? 'Salvar orçamento' : 'Criar orçamento'}
        </Button>

        <Button
          variant="outline"
          disabled={createOrderStatus === 'pending' || deleteOrderStatus === 'pending'}
          asChild={createOrderStatus === 'pending' || deleteOrderStatus === 'pending' ? false : true}
        >
          <Link to={origin === 'budget' ? '/home/budgets' : '..'} relative="path">
            Cancelar
          </Link>
        </Button>
      </div>
    </footer>
  )
}
