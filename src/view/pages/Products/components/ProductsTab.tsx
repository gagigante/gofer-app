import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDebounce } from 'use-debounce'
import { Eye, Pencil, Info } from 'lucide-react'
import { toast } from 'sonner'

import { Tooltip, TooltipTrigger, TooltipContent } from '@/view/components/ui/tooltip'
import { Input } from '@/view/components/ui/input'
import { TabsContent } from '@/view/components/ui/tabs'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Alert, AlertDescription, AlertTitle } from '@/view/components/ui/alert'

import { ProductDetailsDialog } from './ProductDetailsDialog'
import { TableLoading } from '@/view/components/TableLoading'
import { TableActionButton } from '@/view/components/TableActionButton'

import { useBarcode } from '@/view/hooks/useBarcode'
import { useAuth } from '@/view/hooks/useAuth'
import { useProductByBarcode } from '@/view/hooks/queries/products'

import { parseCentsToDecimal } from '@/view/utils/parsers'
import { formatCurrency } from '@/view/utils/formatters'

import { type Brand, type Category, type Product } from '@/api/db/schema'

interface ProductsTabProps {
  products: Array<Product & { category: Category | null } & { brand: Brand | null }>
  isFetching: boolean
  onChangeFilter: (nameFilter: string) => void
}

export function ProductsTab({ products, isFetching, onChangeFilter }: ProductsTabProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

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
        toast('Não foi possível encontrar um produto com este código de barras.')
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
        <Info className="h-4 w-4" />
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

      {isFetching && <TableLoading columns={3} rows={5} />}

      {!isFetching && (
        <Table>
          {products.length === 0 && <TableCaption>Nenhum produto encontrado.</TableCaption>}

          <TableHeader>
            <TableRow>
              <TableHead>sku.</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="max-w-[116px]">Marca</TableHead>
              <TableHead className="max-w-[116px]">Categoria</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead className="min-w-[116px]"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.map(({ id, fastId, name, category, brand, price }) => (
              <TableRow key={id}>
                <TableCell>
                  <p className="font-medium">{fastId}</p>
                </TableCell>

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

                <TableCell className="text-right space-x-1.5">
                  <TableActionButton
                    icon={<Eye className="w-3 h-3" />}
                    variant="outline"
                    tooltip="Ver detalhes do produto"
                    onClick={() => {
                      const product = products.find((item) => item.id === id)
                      if (product) {
                        handleRequestProductDetails(product)
                      }
                    }}
                  />

                  <TableActionButton
                    icon={<Pencil className="w-3 h-3" />}
                    variant="outline"
                    tooltip="Editar produto"
                    onClick={() => {
                      const product = products.find((item) => item.id === id)
                      if (product) {
                        handleRequestProductUpdate(product)
                      }
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

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
