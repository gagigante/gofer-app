import { FaInfo } from 'react-icons/fa'
import * as z from 'zod'
import { useFormContext } from 'react-hook-form'

import { Table, TableBody, TableHead, TableHeader, TableRow, TableCaption } from '@/view/components/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/view/components/ui/tooltip'
import { OrderProductTableRow } from './OrderProductTableRow'

import { createOrderSchema } from '../schema'

export function OrderProductsTable() {
  const { getValues, setValue, watch } = useFormContext<z.infer<typeof createOrderSchema>>()

  function handleUpdateProductPrice(id: string, price: number) {
    const products = getValues('products')

    const updatedProducts = products.map((product) => {
      if (product.id === id) {
        return { ...product, customPrice: price, totalPrice: price * product.quantity }
      }

      return product
    })

    setValue('products', updatedProducts)
  }

  function handleUpdateProductQuantity(id: string, quantity: number) {
    const products = getValues('products')

    const updatedProducts = products.map((product) => {
      if (product.id === id) {
        return { ...product, quantity, totalPrice: product.customPrice * quantity }
      }

      return product
    })

    setValue('products', updatedProducts)
  }

  function handleUpdateProductNote(id: string, note: string) {
    const products = getValues('products')

    const updatedProducts = products.map((item) => {
      if (item.id === id) {
        return { ...item, obs: note }
      }

      return item
    })

    setValue('products', updatedProducts)
  }

  function handleRemoveProductFromOrder(id: string) {
    const products = getValues('products')

    const updatedProducts = products.filter((item) => item.id !== id)

    setValue('products', updatedProducts)
  }

  const products = watch('products')

  return (
    <>
      <h3 className="mt-8 mb-4 text-lg font-semibold">Produtos do pedido</h3>
      <Table>
        {products.length === 0 && <TableCaption>Nenhum produto adicionado no pedido.</TableCaption>}

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
          {products.map(({ id, name, unityPrice, customPrice, quantity, totalPrice }) => (
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
    </>
  )
}
