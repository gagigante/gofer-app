import { useEffect, useState } from 'react'

import { Dialog } from '@/view/components/Dialog'
import { Input } from '@/view/components/ui/input'
import { Combobox } from '@/view/components/Combobox'

import { useProducts } from '@/view/hooks/queries/products'
import { useAuth } from '@/view/hooks/useAuth'

import { type Product } from '@/api/db/schema'
import { type ProductWithCategoryAndBrand } from '@/api/repositories/products-repository'

interface AddOrderProductDialogProps {
  preSelectedProduct: ProductWithCategoryAndBrand | null
  isOpen: boolean
  onClose: () => void
  onSubmit: (product: Product, quantity: number) => void
}

// TODO: deve validar se ha quantidade suficiente
export function AddOrderProductDialog({ preSelectedProduct, isOpen, onClose, onSubmit }: AddOrderProductDialogProps) {
  const { user } = useAuth()

  const [filter, setFilter] = useState('')
  const [product, setProduct] = useState<{ label: string; value: string }>()
  const [quantity, setQuantity] = useState(0)

  const { data: productsResponse } = useProducts(
    {
      loggedUserId: user?.id ?? '',
      name: filter,
      page: 1,
    },
    {
      enabled: !!user,
      placeholderData: (previousData) => previousData,
    },
  )
  const products = (productsResponse?.products ?? []).map((item) => ({ label: item.name!, value: item.id }))

  useEffect(() => {
    if (preSelectedProduct) {
      setProduct({ label: preSelectedProduct.name ?? '', value: preSelectedProduct.id })
      setQuantity(1)
    }
  }, [preSelectedProduct])

  useEffect(() => {
    if (!preSelectedProduct || !isOpen) {
      setProduct(undefined)
      setQuantity(0)
    }
  }, [isOpen])

  function handleSubmit() {
    if (!product) return

    const selectedProduct = productsResponse?.products.find((item) => item.id === product.value)

    if (selectedProduct) {
      onSubmit(selectedProduct, quantity)
      onClose()
    }
  }

  return (
    <Dialog
      title="Adicionar produto ao pedido"
      onProceed={handleSubmit}
      proceedButtonLabel="Adicionar produto"
      isProceedButtonDisabled={quantity === 0 || !product}
      cancelButtonLabel="Cancelar"
      open={isOpen}
      onClose={() => {
        onClose()
      }}
    >
      <div className="flex items-center gap-2">
        <Combobox
          placeholder="Selecione um produto"
          searchPlaceholder="Pesquisar por nome de produto"
          emptyPlaceholder="Nenhum produto encontrado."
          options={products}
          value={product}
          onSelectOption={setProduct}
          onChangeFilter={setFilter}
        />

        <Input
          className="w-full"
          type="number"
          min={0}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
        />
      </div>
    </Dialog>
  )
}
