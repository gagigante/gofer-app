import { useEffect, useRef, useState } from 'react'

import { Label } from '@/view/components/ui/label'
import { Button } from '@/view/components/ui/button'
import { Input } from '@/view/components/ui/input'
import { Combobox } from '@/view/components/Combobox'

import { useProducts } from '@/view/hooks/queries/products'
import { useAuth } from '@/view/hooks/useAuth'

import { type Product } from '@/api/db/schema'
import { type ProductWithCategoryAndBrand } from '@/api/repositories/products-repository'

interface ProductOption {
  label: string
  value: string
}

interface AddOrderProductFormProps {
  preSelectedProduct: ProductWithCategoryAndBrand | null
  onSubmit: (product: Product, quantity: number) => void
}

export function AddOrderProductForm({ preSelectedProduct, onSubmit }: AddOrderProductFormProps) {
  const { user } = useAuth()
  const quantityInputRef = useRef<HTMLInputElement>(null)

  const [filter, setFilter] = useState('')
  const isNumericFilter = filter.match(/^\d+$/)

  const [selectedProduct, setSelectedProduct] = useState<ProductOption>()
  const [quantity, setQuantity] = useState(1)

  const { data: productsResponse, isFetching } = useProducts(
    {
      loggedUserId: user?.id ?? '',
      filterOptions: {
        name: isNumericFilter ? undefined : filter,
        barCode: isNumericFilter ? filter : undefined,
      },
      page: 1,
    },
    {
      enabled: !!user,
      placeholderData: (previousData) => previousData,
    },
  )

  const products = (() => {
    const formattedProducts = (productsResponse?.products ?? []).map((item) => ({ label: item.name!, value: item.id }))

    if (!selectedProduct) {
      return formattedProducts
    }

    const selectedProductIndex = formattedProducts.findIndex((item) => item.value === selectedProduct.value)

    if (selectedProductIndex === -1) {
      return [selectedProduct, ...formattedProducts]
    }

    const selectedProductOption = formattedProducts[selectedProductIndex]

    return [selectedProductOption, ...formattedProducts.filter((item) => item.value !== selectedProductOption.value)]
  })()

  useEffect(() => {
    if (preSelectedProduct) {
      setFilter(preSelectedProduct?.name ?? '')
      setSelectedProduct({ label: preSelectedProduct.name ?? '', value: preSelectedProduct.id })
      setQuantity(1)
      quantityInputRef.current?.focus()
    }
  }, [preSelectedProduct])

  function handleAddProduct(product: ProductOption | undefined, quantity: number) {
    if (!product || quantity === 0) return

    const selectedProduct = productsResponse?.products.find((item) => item.id === product.value)

    if (selectedProduct) {
      onSubmit(selectedProduct, quantity)
      setFilter('')
      setSelectedProduct(undefined)
      setQuantity(1)
    }
  }

  return (
    <div className="flex my-4">
      <div className="w-full flex gap-4 items-end">
        <div className="flex-1 w-full flex flex-col gap-2">
          <Label>Produto *</Label>

          <Combobox
            placeholder="Selecione um produto"
            searchPlaceholder="Pesquisar por nome de produto ou código de barras"
            emptyPlaceholder="Nenhum produto encontrado pelo termo de busca."
            contentClassName="w-[800px]"
            options={products}
            isLoading={isFetching}
            value={selectedProduct}
            onSelectOption={(option) => {
              setSelectedProduct(option)
              quantityInputRef.current?.focus()
            }}
            onChangeFilter={setFilter}
          />
        </div>

        <div className="w-[140px] flex flex-col gap-2">
          <Label>Quantidade</Label>

          <Input
            ref={quantityInputRef}
            className="w-full"
            type="number"
            min={0}
            value={quantity}
            onKeyDown={(e) => {
              e.stopPropagation()

              if (e.key === 'Enter') {
                handleAddProduct(selectedProduct, quantity)
              }
            }}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>

        <Button
          onClick={() => handleAddProduct(selectedProduct, quantity)}
          disabled={!selectedProduct || quantity === 0}
        >
          Adicionar produto
        </Button>
      </div>
    </div>
  )
}
