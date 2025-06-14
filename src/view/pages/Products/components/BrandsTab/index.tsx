import { useEffect, useState } from 'react'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { useDebounce } from 'use-debounce'

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
import { BrandDetails } from './components/BrandDetails'

import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'
import { useMutateOnDeleteBrand } from '@/view/hooks/mutations/brands'

import { type BrandWithProductsQuantity } from '../..'

interface BrandsTabProps {
  brands: BrandWithProductsQuantity[]
  isFetching: boolean
  onChangeFilter: (nameFilter: string) => void
  onDelete: () => void
}

export function BrandsTab({ brands, isFetching, onChangeFilter, onDelete }: BrandsTabProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const { mutateAsync: mutateOnDelete } = useMutateOnDeleteBrand()

  const [selectedBrand, setSelectedBrand] = useState<BrandWithProductsQuantity>()
  const [dialogsVisibility, setDialogsVisibility] = useState({
    createBrand: false,
    brandDetails: false,
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

      toast({
        title: 'Marca removida com sucesso.',
        duration: 3000,
      })
    } catch {
      toast({
        title: 'Houve um erro ao apagar a marca. Tente novamente.',
        duration: 3000,
      })
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
              <TableHead>Nome</TableHead>
              <TableHead className="min-w-[164px]">Produtos associados</TableHead>
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

                    <TooltipContent>
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
                        setSelectedBrand(brand)
                        handleToggleDialog('brandDetails')
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

      <BrandDetails
        brandId={selectedBrand?.id}
        isOpen={dialogsVisibility.brandDetails}
        onClose={() => handleToggleDialog('brandDetails')}
      />

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
