import { useEffect, useState } from 'react'
import { ArrowDownUp, Eye, Pencil, Trash2 } from 'lucide-react'
import { useDebounce } from 'use-debounce'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { Tooltip, TooltipTrigger, TooltipContent } from '@/view/components/ui/tooltip'
import { Input } from '@/view/components/ui/input'
import { TabsContent } from '@/view/components/ui/tabs'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Button } from '@/view/components/ui/button'
import { TableLoading } from '@/view/components/TableLoading'
import { TableActionButton } from '@/view/components/TableActionButton'
import { CreateBrandAction } from './components/CreateBrandAction'
import { DeleteBrandAction } from './components/DeleteBrandAction'
import { UpdateBrandAction } from './components/UpdateBrandAction'

import { useAuth } from '@/view/hooks/useAuth'
import { useMutateOnDeleteBrand } from '@/view/hooks/mutations/brands'

import { type BrandWithProductsQuantity } from '../..'
import { type OrderBy } from '@/api/repositories/brands-repository'

interface BrandsTabProps {
  brands: BrandWithProductsQuantity[]
  isFetching: boolean
  orderBy: OrderBy
  onChangeFilter: (nameFilter: string) => void
  onDelete: () => void
  onOrderByChange: (orderBy: OrderBy) => void
}

export function BrandsTab({ brands, isFetching, orderBy, onChangeFilter, onDelete, onOrderByChange }: BrandsTabProps) {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { mutateAsync: mutateOnDelete } = useMutateOnDeleteBrand()

  const [selectedBrand, setSelectedBrand] = useState<BrandWithProductsQuantity>()
  const [dialogsVisibility, setDialogsVisibility] = useState({
    createBrand: false,
    updateBrand: false,
    deleteBrand: false,
  })

  const [nameFilter, setNameFilter] = useState('')
  const [search] = useDebounce(nameFilter, 250)

  useEffect(() => {
    onChangeFilter(search)
  }, [search])

  function handleToggleDialog(dialog: keyof typeof dialogsVisibility) {
    setDialogsVisibility((prevState) => ({
      ...prevState,
      [dialog]: !prevState[dialog],
    }))
  }

  function handleRequestBrandUpdate(brand: BrandWithProductsQuantity) {
    setSelectedBrand(brand)
    handleToggleDialog('updateBrand')
  }

  function handleRequestBrandDeletion(brand: BrandWithProductsQuantity) {
    setSelectedBrand(brand)
    handleToggleDialog('deleteBrand')
  }

  async function handleDeleteBrand(brandId: string) {
    if (!user) return

    try {
      await mutateOnDelete({ loggedUserId: user.id, brandId })

      toast('Marca removida com sucesso.')
    } catch {
      toast('Houve um erro ao apagar a marca. Tente novamente.')
    } finally {
      setSelectedBrand(undefined)
      onDelete()
    }
  }

  return (
    <TabsContent value="brands">
      <div className="flex justify-end items-center my-4">
        <Button onClick={() => handleToggleDialog('createBrand')}>Adicionar marca</Button>
      </div>

      <Input
        className="mb-4"
        placeholder="Buscar por nome da marca"
        value={nameFilter}
        onChange={(e) => {
          setNameFilter(e.target.value)
        }}
      />

      {isFetching && <TableLoading columns={3} rows={5} />}

      {!isFetching && (
        <Table>
          {brands.length === 0 && <TableCaption>Nenhuma marca encontrada.</TableCaption>}

          <TableHeader>
            <TableRow>
              <TableHead>
                <button
                  className="flex items-center gap-1"
                  onClick={() => {
                    const newOrder = (() => {
                      if (orderBy.column === 'name') {
                        return orderBy.order === 'asc' ? 'desc' : 'asc'
                      }

                      return 'asc'
                    })()

                    onOrderByChange({ column: 'name', order: newOrder })
                  }}
                >
                  Nome <ArrowDownUp className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead className="min-w-[164px]">
                <button
                  className="flex items-center gap-1 text-start"
                  onClick={() => {
                    const newOrder = (() => {
                      if (orderBy.column === 'products') {
                        return orderBy.order === 'asc' ? 'desc' : 'asc'
                      }

                      return 'asc'
                    })()

                    onOrderByChange({ column: 'products', order: newOrder })
                  }}
                >
                  Produtos associados <ArrowDownUp className="w-3 h-3" />
                </button>
              </TableHead>
              <TableHead className="min-w-[160px]"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {brands.map(({ id, name, products }) => (
              <TableRow key={id}>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="font-medium line-clamp-1">{name}</p>
                    </TooltipTrigger>

                    <TooltipContent align="start">
                      <p>{name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{products}</p>
                </TableCell>

                <TableCell className="text-right space-x-1.5">
                  <TableActionButton
                    icon={<Eye className="w-3 h-3" />}
                    variant="outline"
                    tooltip="Ver detalhes da marca"
                    onClick={() => {
                      const brand = brands.find((item) => item.id === id)
                      if (brand) {
                        navigate(`brands/${brand.id}`)
                      }
                    }}
                  />

                  <TableActionButton
                    icon={<Pencil className="w-3 h-3" />}
                    variant="outline"
                    tooltip="Editar marca"
                    onClick={() => {
                      const brand = brands.find((item) => item.id === id)

                      if (brand) {
                        handleRequestBrandUpdate(brand)
                      }
                    }}
                  />

                  <TableActionButton
                    icon={<Trash2 className="w-3 h-3" />}
                    variant="destructive"
                    tooltip="Apagar marca"
                    onClick={() => {
                      const brand = brands.find((item) => item.id === id)

                      if (brand) {
                        handleRequestBrandDeletion(brand)
                      }
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CreateBrandAction
        isOpen={dialogsVisibility.createBrand}
        onClose={() => {
          handleToggleDialog('createBrand')
        }}
      />

      <UpdateBrandAction
        selectedBrand={selectedBrand}
        isOpen={dialogsVisibility.updateBrand}
        onClose={() => {
          handleToggleDialog('updateBrand')
        }}
      />

      <DeleteBrandAction
        isOpen={dialogsVisibility.deleteBrand}
        onDelete={async () => {
          if (!selectedBrand) return

          await handleDeleteBrand(selectedBrand.id)
        }}
        onClose={() => {
          handleToggleDialog('deleteBrand')
        }}
      />
    </TabsContent>
  )
}
