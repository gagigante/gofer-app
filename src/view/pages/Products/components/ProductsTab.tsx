import React, { useState } from 'react'
import { type Category, type Product } from '@prisma/client'
import { FaEye } from 'react-icons/fa'

import { TabsContent } from '@/view/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Button } from '@/view/components/ui/button'
import { ProductDetailsDialog } from './ProductDetailsDialog'

import { parseCentsToDecimal } from '@/view/utils/parsers'
import { formatCurrency } from '@/view/utils/formatters'

interface ProductsTabProps {
  products: Array<Product & { category: Category | null }>
}

export function ProductsTab({ products }: ProductsTabProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product & { category: Category | null }>()
  const [isProductDetailsDialogOpen, setIsProductDetailsDialog] = useState(false)

  function handleRequestProductDetails(product: Product & { category: Category | null }) {
    setSelectedProduct(product)
    setIsProductDetailsDialog(true)
  }

  return (
    <TabsContent value="products">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead>Qtd. disponível em estoque</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map(({ id, name, category, price, availableQuantity }) => (
            <TableRow key={id}>
              <TableCell>
                <p className="font-medium">{name}</p>
              </TableCell>

              <TableCell>
                <p className="font-medium">{category?.name ?? 'N/A'}</p>
              </TableCell>

              <TableCell>
                <p className="font-medium">{formatCurrency(parseCentsToDecimal(price))}</p>
              </TableCell>

              <TableCell>
                <p className="font-medium">{availableQuantity}</p>
              </TableCell>

              <TableCell className="flex-nowrap text-right space-x-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const product = products.find((item) => item.id === id)
                    if (product) {
                      handleRequestProductDetails(product)
                    }
                  }}
                >
                  <FaEye className="w-3 h-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ProductDetailsDialog
        product={selectedProduct}
        isOpen={isProductDetailsDialogOpen}
        onRequestEdit={console.log}
        onClose={() => {
          setIsProductDetailsDialog(false)
          setSelectedProduct(undefined)
        }}
      />
    </TabsContent>
  )
}
