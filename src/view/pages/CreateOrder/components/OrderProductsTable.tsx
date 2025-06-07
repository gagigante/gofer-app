import { useFormContext } from 'react-hook-form'

import { Table, TableBody, TableHead, TableHeader, TableRow, TableCaption } from '@/view/components/ui/table'
import { OrderProductTableRow } from './OrderProductTableRow'

import { type CreateOrderSchema } from '../schema'

export function OrderProductsTable() {
  const { getValues, setValue, watch } = useFormContext<CreateOrderSchema>()

  function handleUpdateProductPrice(id: string, price: number) {
    const products = getValues('products')

    const updatedProducts = products.map((product) => {
      if (product.id === id) {
        return {
          ...product,
          customPrice: price,
          totalPrice: price * product.quantity,
          totalCostPrice: product.costPrice * product.quantity,
        }
      }

      return product
    })

    setValue('products', updatedProducts)
  }

  function handleUpdateProductQuantity(id: string, quantity: number) {
    const products = getValues('products')

    const updatedProducts = products.map((product) => {
      if (product.id === id) {
        return {
          ...product,
          quantity,
          totalPrice: product.customPrice * quantity,
          totalCostPrice: product.costPrice * quantity,
        }
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
            <TableHead>Preço de custo</TableHead>
            <TableHead className="min-w-[96px]">Preço unitário</TableHead>
            <TableHead className="min-w-[124px]">Preço unitário para o pedido</TableHead>
            <TableHead>Qtd.</TableHead>
            <TableHead className="min-w-[116px]">Preço total</TableHead>
            <TableHead className="min-w-[116px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody onKeyDown={(e) => e.stopPropagation()}>
          {products.map(({ id, name, costPrice, unityPrice, customPrice, quantity, totalPrice, obs }) => (
            <OrderProductTableRow
              key={id}
              id={id}
              name={name}
              costPrice={costPrice}
              unityPrice={unityPrice}
              customPrice={customPrice}
              quantity={quantity}
              totalPrice={totalPrice}
              obs={obs}
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
