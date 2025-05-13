import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { FaInfoCircle } from 'react-icons/fa'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

import { Button } from '@/view/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/view/components/ui/alert'
import { AddOrderProductForm } from './components/AddOrderProductForm'
import { CustomerFormSection } from './components/CustomerFormSection'
import { AddressFormSection } from './components/AddressFormSection'
import { ObsFormSection } from './components/ObsFormSection'
import { OrderProductsTable } from './components/OrderProductsTable'

import { useToast } from '@/view/components/ui/use-toast'
import { useAuth } from '@/view/hooks/useAuth'
import { useBarcode } from '@/view/hooks/useBarcode'
import { useProductByBarcode } from '@/view/hooks/queries/products'
import { useMutateOnCreateOrder } from '@/view/hooks/mutations/orders'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

import { createOrderSchema } from './schema'
import { type Product } from '@/api/db/schema'
import { type OrdersApi, apiName } from '@/api/exposes/orders-api'

export function CreateOrder() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const { barcode, clearBarcodeState } = useBarcode()
  const { mutateAsync, status } = useMutateOnCreateOrder()

  const form = useForm<z.infer<typeof createOrderSchema>>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      customer: null,
      obs: '',
      zipcode: '',
      city: '',
      street: '',
      neighborhood: '',
      complement: '',
      products: [],
    },
  })

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

  const products = form.watch('products')

  function handleAddProductToOrder({ id, name, price }: Product, quantity: number) {
    if (products.length === 0) {
      form.setValue('products', [
        {
          id,
          name: name ?? '',
          unityPrice: price ?? 0,
          customPrice: price ?? 0,
          quantity,
          totalPrice: (price ?? 0) * quantity,
          obs: '',
        },
      ])
      clearBarcodeState()
      return
    }

    const alreadyInOrder = products.find((item) => item.id === id)

    if (!alreadyInOrder) {
      form.setValue('products', [
        {
          id,
          name: name ?? '',
          unityPrice: price ?? 0,
          customPrice: price ?? 0,
          quantity,
          totalPrice: (price ?? 0) * quantity,
          obs: '',
        },
        ...products,
      ])
      clearBarcodeState()
      return
    }

    const updatedProducts = products.map((item) => {
      if (item.id === id) {
        const newQuantity = item.quantity + quantity
        return {
          ...item,
          quantity: newQuantity,
          totalPrice: (item.customPrice ?? item.unityPrice) * newQuantity,
        }
      }

      return item
    })

    form.setValue('products', updatedProducts)
    clearBarcodeState()
    return
  }

  async function handleCreateOrder(data: z.infer<typeof createOrderSchema>) {
    if (!user) return

    mutateAsync(
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
      },
      {
        onError: () => {
          toast({
            title: 'Algo deu errado ao tentar criar o pedido. Tente novamente.',
            duration: 3000,
          })
        },
        onSuccess: async (response) => {
          if (!response) return

          await handleDownloadFile(response.id)

          toast({
            title: 'Pedido criado com sucesso.',
            duration: 3000,
          })

          navigate('..', { relative: 'path' })
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
      toast({
        title: 'Algo deu errado ao tentar baixar o arquivo. Acesse o arquivo na listagem de pedidos.',
        duration: 3000,
      })
    }
  }

  const orderTotal = (() => {
    return products.reduce((acc, item) => {
      return acc + item.totalPrice
    }, 0)
  })()

  return (
    <FormProvider {...form}>
      <div className="h-full flex flex-col">
        <div className="flex-1 px-3 py-6 overflow-auto">
          <h2 className="mb-8 text-3xl font-semibold tracking-tight">Criar novo pedido</h2>

          <Alert>
            <FaInfoCircle className="h-4 w-4" />
            <AlertTitle>Busca de produtos por código de barra</AlertTitle>
            <AlertDescription>
              Você pode escanear o código de barras de um produto para adiciona-lo ao pedido.
            </AlertDescription>
          </Alert>

          <AddOrderProductForm preSelectedProduct={data ?? null} onSubmit={handleAddProductToOrder} />
          <ObsFormSection />
          <OrderProductsTable />
          <CustomerFormSection />
          <AddressFormSection />
        </div>

        <footer className="flex items-center px-3 py-4 border-t border-border">
          <p>
            <strong>Total a pagar: </strong>
            {formatCurrency(parseCentsToDecimal(orderTotal))}
          </p>

          <div className="flex gap-2 ml-auto">
            <Button
              onClick={form.handleSubmit(handleCreateOrder)}
              disabled={products.length === 0 || status === 'pending'}
            >
              {status === 'pending' && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
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
    </FormProvider>
  )
}
