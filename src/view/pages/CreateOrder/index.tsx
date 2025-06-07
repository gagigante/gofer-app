import { useEffect } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { useLocation } from 'react-router-dom'
import { FaInfoCircle } from 'react-icons/fa'
import { zodResolver } from '@hookform/resolvers/zod'

import { Alert, AlertDescription, AlertTitle } from '@/view/components/ui/alert'
import { AddOrderProductForm } from './components/AddOrderProductForm'
import { CustomerFormSection } from './components/CustomerFormSection'
import { AddressFormSection } from './components/AddressFormSection'
import { ObsFormSection } from './components/ObsFormSection'
import { OrderProductsTable } from './components/OrderProductsTable'
import { Footer } from './components/Footer'

import { useToast } from '@/view/components/ui/use-toast'
import { useAuth } from '@/view/hooks/useAuth'
import { useBarcode } from '@/view/hooks/useBarcode'
import { useProductByBarcode } from '@/view/hooks/queries/products'

import { type CreateOrderSchema, createOrderSchema } from './schema'
import { type Product } from '@/api/db/schema'
import { type GetOrderResponse } from '@/api/controllers/orders-controller'

export function CreateOrder() {
  const { state } = useLocation()
  const { user } = useAuth()
  const { toast } = useToast()
  const { barcode, clearBarcodeState } = useBarcode()

  const form = useForm<CreateOrderSchema>({
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

  const cameFromBudgetsPage = (state?.draft ?? false) as boolean
  const draftData = state?.draftData as GetOrderResponse['data'] | undefined

  useEffect(() => {
    const parseProducts = (
      products: NonNullable<GetOrderResponse['data']>['products'],
    ): CreateOrderSchema['products'] => {
      return products.map((product) => ({
        id: product.productId ?? '',
        name: product.name ?? '',
        costPrice: product.costPrice ?? 0,
        unityPrice: product.price ?? 0,
        customPrice: product.customPrice ?? 0,
        quantity: product.quantity ?? 0,
        totalCostPrice: (product.costPrice ?? 0) * (product.quantity ?? 0),
        totalPrice: (product.customPrice ?? 0) * (product.quantity ?? 0),
        obs: product.obs ?? '',
      }))
    }

    if (draftData) {
      form.setValue(
        'customer',
        draftData.customer ? { id: draftData.customer.id, name: draftData.customer.name ?? '' } : null,
      )
      form.setValue('obs', draftData.obs ?? '')
      form.setValue('city', draftData.city ?? '')
      form.setValue('complement', draftData.complement ?? '')
      form.setValue('neighborhood', draftData.neighborhood ?? '')
      form.setValue('street', draftData.street ?? '')
      form.setValue('zipcode', draftData.zipcode ?? '')
      form.setValue('products', parseProducts(draftData.products ?? []))
    }
  }, [draftData])

  function handleAddProductToOrder({ id, name, price, costPrice }: Product, quantity: number) {
    if (products.length === 0) {
      form.setValue('products', [
        {
          id,
          name: name ?? '',
          costPrice: costPrice ?? 0,
          unityPrice: price ?? 0,
          customPrice: price ?? 0,
          quantity,
          totalCostPrice: (costPrice ?? 0) * quantity,
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
          costPrice: costPrice ?? 0,
          unityPrice: price ?? 0,
          customPrice: price ?? 0,
          quantity,
          totalCostPrice: (costPrice ?? 0) * quantity,
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
          totalCostPrice: (item.costPrice ?? 0) * newQuantity,
          totalPrice: (item.customPrice ?? item.unityPrice) * newQuantity,
        }
      }

      return item
    })

    form.setValue('products', updatedProducts)
    clearBarcodeState()
    return
  }

  const { orderTotal, orderCostPrice } = (() => {
    return products.reduce(
      (acc, item) => {
        return {
          orderTotal: acc.orderTotal + item.totalPrice,
          orderCostPrice: acc.orderCostPrice + item.totalCostPrice,
        }
      },
      { orderTotal: 0, orderCostPrice: 0 },
    )
  })()

  return (
    <FormProvider {...form}>
      <div className="h-full flex flex-col">
        <div className="flex-1 px-3 py-6 overflow-auto">
          <h2 className="mb-8 text-3xl font-semibold tracking-tight">Criar novo pedido ou orçamento</h2>

          <Alert>
            <FaInfoCircle className="h-4 w-4" />
            <AlertTitle>Busca de produtos por código de barra</AlertTitle>
            <AlertDescription>
              Você pode escanear o código de barras de um produto para adiciona-lo ao pedido.
            </AlertDescription>
          </Alert>

          <AddOrderProductForm preSelectedProduct={data ?? null} onSubmit={handleAddProductToOrder} />
          <OrderProductsTable />
          <ObsFormSection />
          <CustomerFormSection />
          <AddressFormSection />
        </div>

        <Footer
          draftOrderId={state?.draftData?.id}
          orderTotal={orderTotal}
          orderCostPrice={orderCostPrice}
          origin={cameFromBudgetsPage ? 'budget' : 'order'}
        />
      </div>
    </FormProvider>
  )
}
