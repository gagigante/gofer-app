import { useState } from 'react'
import { Link, useNavigate, type NavigateOptions } from 'react-router-dom'
import { useFormContext } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@/view/components/ui/button'
import { ConfirmationDialog } from './ConfirmationDialog'

import { useMutateOnCreateOrder, useMutateOnDeleteOrder } from '@/view/hooks/mutations/orders'
import { useAuth } from '@/view/hooks/useAuth'

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

  const [actionType, setActionType] = useState<'order' | 'budget'>('order')
  const [isOpen, setIsOpen] = useState(false)

  const form = useFormContext<CreateOrderSchema>()

  const { mutateAsync: mutateOnCreateOrder, status: createOrderStatus } = useMutateOnCreateOrder()
  const { mutateAsync: mutateOnDeleteOrder, status: deleteOrderStatus } = useMutateOnDeleteOrder()

  const hasDraft = !!draftOrderId

  async function handleRequestCreation(type: 'order' | 'budget') {
    setActionType(type)
    setIsOpen(true)
  }

  function handleConfirmCreation(type: 'order' | 'budget') {
    if (type === 'order') {
      form.handleSubmit(handleCreateOrder)()
    } else {
      form.handleSubmit(handleCreateBudget)()
    }
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
          toast(errorMessage)
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
          toast(errorMessage)
        },
        onSuccess: async (response) => {
          if (!response) return

          toast(successMessage)

          navigate(navigateOptions.to, navigateOptions.options)

          await handleDownloadFile(response.id)
        },
      },
    )
  }

  async function handleDownloadFile(orderId: string) {
    if (!user) return

    const { err } = await (window as unknown as Record<typeof apiName, OrdersApi>).ordersApi.generateFile({
      loggedUserId: user.id,
      orderId,
    })

    if (err) {
      toast('Algo deu errado ao tentar baixar o arquivo. Acesse o arquivo na listagem de pedidos.')
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
        <Button onClick={() => handleRequestCreation('order')} disabled={products.length === 0}>
          Criar pedido
        </Button>

        <Button variant="outline" onClick={() => handleRequestCreation('budget')} disabled={products.length === 0}>
          {hasDraft ? 'Salvar orçamento' : 'Criar orçamento'}
        </Button>

        <Button variant="outline" asChild>
          <Link to={origin === 'budget' ? '/home/budgets' : '..'} relative="path">
            Cancelar
          </Link>
        </Button>
      </div>

      <ConfirmationDialog
        actionType={actionType}
        hasDraft={hasDraft}
        isOpen={isOpen}
        isLoading={createOrderStatus === 'pending' || deleteOrderStatus === 'pending'}
        onConfirm={() => handleConfirmCreation(actionType)}
        onClose={() => setIsOpen(false)}
      />
    </footer>
  )
}
