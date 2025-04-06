import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEye, FaPencilAlt, FaInfoCircle } from 'react-icons/fa'
import { useDebounce } from 'use-debounce'

import { Tooltip, TooltipTrigger, TooltipContent } from '@/view/components/ui/tooltip'
import { Input } from '@/view/components/ui/input'
import { TabsContent } from '@/view/components/ui/tabs'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Button } from '@/view/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/view/components/ui/alert'

import { ProductDetailsDialog } from './ProductDetailsDialog'

import { useBarcode } from '@/view/hooks/useBarcode'
import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'
import { useProductByBarcode } from '@/view/hooks/queries/products'

import { parseCentsToDecimal } from '@/view/utils/parsers'
import { formatCurrency } from '@/view/utils/formatters'

import { type Brand, type Category, type Product } from '@/api/db/schema'

interface ProductsTabProps {
  products: Array<Product & { category: Category | null } & { brand: Brand | null }>
  onChangeFilter: (nameFilter: string) => void
}

export function ProductsTab({ products, onChangeFilter }: ProductsTabProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()
  const { barcode, clearBarcodeState } = useBarcode()

  const { data, error } = useProductByBarcode(
    { loggedUserId: user?.id ?? '', barcode: barcode },
    {
      enabled: !!user?.id && !!barcode,
      retry: false,
    },
  )

  const [selectedProduct, setSelectedProduct] = useState<
    Product & { category: Category | null } & { brand: Brand | null }
  >()
  const [isProductDetailsDialogOpen, setIsProductDetailsDialog] = useState(false)

  const [nameFilter, setNameFilter] = useState('')
  const [search] = useDebounce(nameFilter, 250)

  useEffect(() => {
    if (data) {
      handleRequestProductDetails(data)
    }
  }, [data])

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

  useEffect(() => {
    onChangeFilter(search)
  }, [search])

  function handleRequestProductDetails(product: Product & { category: Category | null } & { brand: Brand | null }) {
    setSelectedProduct(product)
    setIsProductDetailsDialog(true)
  }

  function handleRequestProductUpdate(product: Product & { category: Category | null }) {
    navigate('update', { state: { selectedProduct: product } })
  }

  return (
    <TabsContent value="products">
      <Alert className="mt-[4.5rem]">
        <FaInfoCircle className="h-4 w-4" />
        <AlertTitle>Busca de produtos por código de barra</AlertTitle>
        <AlertDescription>Você pode escanear o código de barras de um produto para exibir detalhes.</AlertDescription>
      </Alert>

      <Input
        className="my-4"
        placeholder="Buscar por nome do produto"
        value={nameFilter}
        onChange={(e) => {
          setNameFilter(e.target.value)
        }}
      />

      <Table>
        {products.length === 0 && <TableCaption>Nenhum produto encontrado.</TableCaption>}

        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead className="max-w-[116px]">Marca</TableHead>
            <TableHead className="max-w-[116px]">Categoria</TableHead>
            <TableHead>Preço</TableHead>
            <TableHead className="max-w-[116px]">
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="line-clamp-1">Qtd. disponível em estoque</p>
                </TooltipTrigger>

                <TooltipContent>
                  <p>Qtd. disponível em estoque</p>
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead className="min-w-[116px]"></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {products.map(({ id, name, category, brand, price, availableQuantity }) => (
            <TableRow key={id}>
              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="font-medium line-clamp-1">{name}</p>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>{name}</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>

              <TableCell>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="font-medium line-clamp-1">{brand?.name ?? 'N/A'}</p>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>{brand?.name ?? 'N/A'}</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>

              <TableCell className="max-w-[100px]">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="font-medium line-clamp-1">{category?.name ?? 'N/A'}</p>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>{category?.name ?? 'N/A'}</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>

              <TableCell>
                <p className="font-medium">{formatCurrency(parseCentsToDecimal(price ?? 0))}</p>
              </TableCell>

              <TableCell>
                <p className="font-medium">{availableQuantity}</p>
              </TableCell>

              <TableCell className="text-right space-x-1.5">
                <Tooltip>
                  <TooltipTrigger asChild>
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
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>Ver detalhes do produto</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const product = products.find((item) => item.id === id)
                        if (product) {
                          handleRequestProductUpdate(product)
                        }
                      }}
                    >
                      <FaPencilAlt className="w-3 h-3" />
                    </Button>
                  </TooltipTrigger>

                  <TooltipContent>
                    <p>Editar produto</p>
                  </TooltipContent>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ProductDetailsDialog
        product={selectedProduct}
        isOpen={isProductDetailsDialogOpen}
        onRequestEdit={handleRequestProductUpdate}
        onClose={() => {
          setIsProductDetailsDialog(false)
          setSelectedProduct(undefined)
          clearBarcodeState()
        }}
      />
    </TabsContent>
  )
}
