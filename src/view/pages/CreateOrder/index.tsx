import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaInfoCircle, FaInfo } from 'react-icons/fa'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/view/components/ui/tooltip'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCaption } from '@/view/components/ui/table'
import { Button } from '@/view/components/ui/button'
import { Textarea } from '@/view/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/view/components/ui/alert'
import { Label } from '@/view/components/ui/label'
import { AddOrderProductForm } from './components/AddOrderProductForm'
import { Combobox } from '@/view/components/Combobox'
import { CreateCustomerPopover } from './components/CreateCustomerPopover'
import { OrderProductTableRow } from './components/OrderProductTableRow'

import { useToast } from '@/view/components/ui/use-toast'
import { useAuth } from '@/view/hooks/useAuth'
import { useBarcode } from '@/view/hooks/useBarcode'
import { useProductByBarcode } from '@/view/hooks/queries/products'
import { useCustomers } from '@/view/hooks/queries/customers'
import { useMutateOnCreateOrder } from '@/view/hooks/mutations/orders'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

import { type Product } from '@/api/db/schema'

interface OrderProduct {
  id: string
  name: string
  unityPrice: number
  customPrice: number
  quantity: number
  totalPrice: number
  obs?: string
}

export function CreateOrder() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const { barcode, clearBarcodeState } = useBarcode()
  const { mutateAsync } = useMutateOnCreateOrder()

  const [customersFilter, setCustomersFilter] = useState('')
  const [orderObs, setOrderObs] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>()
  const [orderProducts, setOrderProducts] = useState<OrderProduct[]>([])

  const { data: customersResponse } = useCustomers(
    {
      loggedUserId: user?.id ?? '',
      name: customersFilter,
      page: 1,
    },
    {
      enabled: !!user,
      placeholderData: (previousData) => previousData,
    },
  )
  const customers = (customersResponse?.customers ?? []).map((item) => ({ label: item.name!, value: item.id }))

  const { data, error } = useProductByBarcode(
    { loggedUserId: user?.id ?? '', barcode: barcode },
    {
      enabled: !!user?.id && !!barcode,
      retry: false,
    },
  )

  useEffect(() => {
    if (error) {
      if (error.message === 'NotFoundError') {
        toast({
          title: 'Não foi possível encontrar um produto com este código de barras.',
          duration: 3000,
        })
        clearBarcodeState()
      }
    }
  }, [error])

  function handleAddProductToOrder({ id, name, price }: Product, quantity: number) {
    setOrderProducts((prevState) => {
      if (prevState.length === 0) {
        return [
          {
            id,
            name: name ?? '',
            unityPrice: price ?? 0,
            customPrice: price ?? 0,
            quantity,
            totalPrice: (price ?? 0) * quantity,
          },
          ...prevState,
        ]
      }

      const alreadyInOrder = prevState.find((item) => item.id === id)

      if (!alreadyInOrder) {
        return [
          {
            id,
            name: name ?? '',
            unityPrice: price ?? 0,
            customPrice: price ?? 0,
            quantity,
            totalPrice: (price ?? 0) * quantity,
          },
          ...prevState,
        ]
      }

      return prevState.map((item) => {
        if (item.id === id) {
          return { ...item, quantity: item.quantity + quantity }
        }

        return item
      })
    })
    clearBarcodeState()
  }

  function handleUpdateProductPrice(id: string, price: number) {
    setOrderProducts((prevState) =>
      prevState.map((product) => {
        if (product.id === id) {
          return { ...product, customPrice: price, totalPrice: price * product.quantity }
        }

        return product
      }),
    )
  }

  function handleUpdateProductQuantity(id: string, quantity: number) {
    setOrderProducts((prevState) =>
      prevState.map((product) => {
        if (product.id === id) {
          return { ...product, quantity, totalPrice: product.customPrice * quantity }
        }

        return product
      }),
    )
  }

  function handleUpdateProductNote(id: string, note: string) {
    setOrderProducts((prevState) =>
      prevState.map((item) => {
        if (item.id === id) {
          return { ...item, obs: note }
        }

        return item
      }),
    )
  }

  function handleRemoveProductFromOrder(id: string) {
    setOrderProducts((prevState) => prevState.filter((item) => item.id !== id))
  }

  async function handleCreateOrder() {
    if (!user) return

    mutateAsync(
      {
        loggedUserId: user.id,
        products: orderProducts.map(({ id, quantity, customPrice, obs }) => ({
          id,
          quantity,
          customProductPrice: customPrice,
          obs,
        })),
        customerId: selectedCustomerId,
        obs: orderObs,
      },
      {
        onError: () => {
          toast({
            title: 'Algo deu errado ao tentar criar o pedido. Tente novamente.',
            duration: 3000,
          })
        },
        onSuccess: () => {
          toast({
            title: 'Pedido criado com sucesso.',
            duration: 3000,
          })

          navigate('..', { relative: 'path' })
        },
      },
    )
  }

  const orderTotal = (() => {
    return orderProducts.reduce((acc, item) => {
      return acc + item.totalPrice
    }, 0)
  })()

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-3 py-6 overflow-auto">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Criar novo pedido</h2>

        <Alert>
          <FaInfoCircle className="h-4 w-4" />
          <AlertTitle>Busca de produtos por código de barra</AlertTitle>
          <AlertDescription>
            Você pode escanear o código de barras de um produto para adiciona-lo ao pedido.
          </AlertDescription>
        </Alert>

        <div className="flex my-4">
          <div className="flex flex-1 items-end gap-2">
            <div className="flex flex-1 flex-col gap-3">
              <Label>Cliente</Label>
              <Combobox
                placeholder="Selecione um cliente"
                searchPlaceholder="Busque pelo nome do cliente"
                emptyPlaceholder="Nenhum cliente encontrado."
                options={customers}
                onChangeFilter={setCustomersFilter}
                value={customers.find((item) => item.value === selectedCustomerId)}
                onSelectOption={({ value }) => setSelectedCustomerId(value)}
              />
            </div>

            <CreateCustomerPopover />
          </div>
        </div>

        <div className="flex my-4">
          <AddOrderProductForm preSelectedProduct={data ?? null} onSubmit={handleAddProductToOrder} />
        </div>

        <div className="grid w-full space-y-2 my-4">
          <Label htmlFor="obs">Observações</Label>
          <Textarea
            id="obs"
            placeholder="Adicione observações ao pedido"
            value={orderObs}
            onChange={(e) => setOrderObs(e.target.value)}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>

        <Table>
          {orderProducts.length === 0 && <TableCaption>Nenhum produto adicionado no pedido.</TableCaption>}

          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead className="min-w-[96px]">
                Preço unitário
                <Tooltip>
                  <TooltipTrigger tabIndex={-1}>
                    <div className="ml-2 rounded-full border p-[2px]">
                      <FaInfo className="w-2 h-2" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Preço unitário original para o produto</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead className="min-w-[124px]">
                Preço unitário para o pedido
                <Tooltip>
                  <TooltipTrigger tabIndex={-1}>
                    <div className="ml-2 rounded-full border p-[2px]">
                      <FaInfo className="w-2 h-2" />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Preço unitário do produto para este pedido</p>
                  </TooltipContent>
                </Tooltip>
              </TableHead>
              <TableHead>Qtd.</TableHead>
              <TableHead className="min-w-[116px]">Preço total</TableHead>
              <TableHead className="min-w-[116px]"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody onKeyDown={(e) => e.stopPropagation()}>
            {orderProducts.map(({ id, name, unityPrice, customPrice, quantity, totalPrice }) => (
              <OrderProductTableRow
                key={id}
                id={id}
                name={name}
                unityPrice={unityPrice}
                customPrice={customPrice}
                quantity={quantity}
                totalPrice={totalPrice}
                onRequestPriceUpdate={handleUpdateProductPrice}
                onRequestQuantityUpdate={handleUpdateProductQuantity}
                onRequestNoteUpdate={handleUpdateProductNote}
                onRequestRemove={handleRemoveProductFromOrder}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      <footer className="flex items-center px-3 py-4 border-t border-border">
        <p>
          <strong>Total a pagar: </strong>
          {formatCurrency(parseCentsToDecimal(orderTotal))}
        </p>

        <div className="flex gap-2 ml-auto">
          <Button onClick={handleCreateOrder} disabled={orderProducts.length === 0}>
            Criar pedido
          </Button>

          <Button variant="outline" asChild>
            <Link to=".." relative="path">
              Cancelar
            </Link>
          </Button>
        </div>
      </footer>
    </div>
  )
}
