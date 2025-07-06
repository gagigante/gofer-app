import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Unlink } from 'lucide-react'

import { Button } from '@/view/components/ui/button'
import { Label } from '@/view/components/ui/label'
import { Input } from '@/view/components/ui/input'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Skeleton } from '@/view/components/ui/skeleton'
import { Footer } from '@/view/components/Footer'
import { TableLoading } from '@/view/components/TableLoading'
import { TableActionButton } from '@/view/components/TableActionButton'
import { RemoveProductFromBrandAction } from './components/RemoveProductFromBrandAction'

import { useToast } from '@/view/components/ui/use-toast'
import { useAuth } from '@/view/hooks/useAuth'
import { useBrand } from '@/view/hooks/queries/brands'
import { useProducts } from '@/view/hooks/queries/products'
import { useMutateOnUpdateProduct } from '@/view/hooks/mutations/products'

import { type ProductWithCategoryAndBrand } from '@/api/repositories/products-repository'
import { type UpdateProductRequest } from '@/api/controllers/products-controller'

export function BrandDetails() {
  const navigate = useNavigate()
  const { brand_id } = useParams()
  const { toast } = useToast()
  const { user } = useAuth()

  const [pagination, setPagination] = useState(1)
  const [nameFilter, setNameFilter] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<ProductWithCategoryAndBrand>()
  const [isRemoveProductFromBrandActionOpen, setIsRemoveProductFromBrandActionOpen] = useState(false)

  const { data: brandData, isFetching: isBrandLoading } = useBrand(
    {
      loggedUserId: user?.id ?? '',
      brandId: brand_id ?? '',
    },
    {
      enabled: !!user && !!brand_id,
    },
  )

  const { data: productsData, isFetching: isProductsLoading } = useProducts({
    loggedUserId: user?.id ?? '',
    filterOptions: {
      brandId: brand_id ?? '',
      name: nameFilter,
    },
    page: pagination,
  })

  const products = productsData?.products ?? []

  const { mutateAsync: updateProductMutation } = useMutateOnUpdateProduct()

  async function handleRemoveProductFromBrand() {
    if (!selectedProduct || !user) return

    const { category: _, brand: __, brandId: ___, id, ...product } = selectedProduct

    try {
      await updateProductMutation({
        loggedUserId: user.id,
        productId: id,
        ...product,
        brandId: undefined,
      } as UpdateProductRequest)

      toast({
        title: 'Produto removido da marca com sucesso.',
        duration: 3000,
      })
    } catch {
      toast({
        title: 'Houve um erro ao remover o produto da marca. Tente novamente.',
        duration: 3000,
      })
    } finally {
      setSelectedProduct(undefined)
      setIsRemoveProductFromBrandActionOpen(false)
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-3 py-6 overflow-auto">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Detalhes da marca</h2>

        <div className="flex flex-col items-start gap-3">
          <Label htmlFor="name" className="text-right">
            Nome
          </Label>
          {isBrandLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Input placeholder="Nome da marca" className="col-span-3" value={brandData?.name ?? ''} readOnly disabled />
          )}
        </div>

        <h3 className="mt-8 text-xl font-semibold tracking-tight transition-colors">Produtos associados</h3>

        <Input
          className="my-4"
          placeholder="Buscar por nome do produto"
          value={nameFilter}
          onChange={(e) => {
            setNameFilter(e.target.value)
          }}
        />

        {isProductsLoading ? (
          <TableLoading columns={4} rows={5} />
        ) : (
          <Table>
            {products.length === 0 && <TableCaption>Nenhum produto encontrado.</TableCaption>}

            <TableHeader>
              <TableRow>
                <TableHead>ID. rápido</TableHead>
                <TableHead>Cód. de barras</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <p className="font-medium">{product.fastId}</p>
                  </TableCell>

                  <TableCell>
                    <p className="font-medium">{product.barCode || 'N/A'}</p>
                  </TableCell>

                  <TableCell>
                    <p className="font-medium">{product.name}</p>
                  </TableCell>

                  <TableCell className="flex items-center justify-end">
                    <TableActionButton
                      tooltip="Desassociar produto desta marca"
                      variant="outline"
                      icon={<Unlink className="w-3 h-3" />}
                      onClick={() => {
                        setSelectedProduct(product)
                        setIsRemoveProductFromBrandActionOpen(true)
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <Footer page={pagination} total={productsData?.total ?? 0} onChange={setPagination}>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" className="ml-auto" onClick={() => navigate(-1)}>
            Voltar
          </Button>
        </div>
      </Footer>

      <RemoveProductFromBrandAction
        isOpen={isRemoveProductFromBrandActionOpen}
        onRemove={handleRemoveProductFromBrand}
        onClose={() => setIsRemoveProductFromBrandActionOpen(false)}
      />
    </div>
  )
}
