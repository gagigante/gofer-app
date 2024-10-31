import { useEffect, useState } from 'react'
import { FaEye, FaPencilAlt, FaTrash } from 'react-icons/fa'
import { useDebounce } from 'use-debounce'
import type * as z from 'zod'

import { Input } from '@/view/components/ui/input'
import { TabsContent } from '@/view/components/ui/tabs'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Button } from '@/view/components/ui/button'
import { CreateBrandAction } from './components/CreateBrandAction'
import { DeleteBrandAction } from './components/DeleteBrandAction'
import { UpdateBrandAction } from './components/UpdateBrandAction'

import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'
import { useMutateOnDeleteBrand, useMutateOnUpdateBrand } from '@/view/hooks/mutations/brands'

import { BrandWithProductsQuantity } from '../..'

import { createBrandSchema } from './components/CreateBrandAction/schema'
import { BrandDetails } from './components/BrandDetails'

interface BrandsTabProps {
  brands: BrandWithProductsQuantity[]
  onChangeFilter: (nameFilter: string) => void
  onDelete: () => void
}

export function BrandsTab({ brands, onChangeFilter, onDelete }: BrandsTabProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const { mutateAsync: mutateOnUpdate } = useMutateOnUpdateBrand()
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

  async function handleUpdateBrand(data: z.infer<typeof createBrandSchema> & { brandId: string }) {
    if (!user) return

    await mutateOnUpdate(
      {
        loggedUserId: user.id,
        brandId: data.brandId,
        updatedName: data.name,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Marca atualizada com sucesso.',
            duration: 3000,
          })

          handleToggleDialog('updateBrand')
          setSelectedBrand(undefined)
        },
        onError: (err) => {
          if (err.message === 'BrandAlreadyExistsError') {
            toast({
              title: 'Ja existe uma marca com este nome.',
              duration: 3000,
            })
            return
          }

          toast({
            title: 'Houve um erro ao atualizar a marca. Tente novamente.',
            duration: 3000,
          })

          handleToggleDialog('updateBrand')
          setSelectedBrand(undefined)
        },
      },
    )
  }

  function handleRequestBrandDeletion(brand: BrandWithProductsQuantity) {
    setSelectedBrand(brand)
    handleToggleDialog('deleteBrand')
  }

  async function handleDeleteBrand(brandId: string) {
    if (!user) return

    handleToggleDialog('deleteBrand')
    setSelectedBrand(undefined)

    await mutateOnDelete(
      { loggedUserId: user.id, brandId },
      {
        onSuccess: () => {
          toast({
            title: 'Marca removida com sucesso.',
            duration: 3000,
          })
          onDelete()
        },
        onError: () => {
          toast({
            title: 'Houve um erro ao apagar a marca. Tente novamente.',
            duration: 3000,
          })
        },
      },
    )
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

      <Table>
        {brands.length === 0 && <TableCaption>Nenhuma marca encontrada.</TableCaption>}

        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Produtos associados</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {brands.map(({ id, name, products }) => (
            <TableRow key={id}>
              <TableCell>
                <p className="font-medium">{name}</p>
              </TableCell>

              <TableCell>
                <p className="font-medium">{products}</p>
              </TableCell>

              <TableCell className="flex-nowrap text-right space-x-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const brand = brands.find((item) => item.id === id)
                    if (brand) {
                      setSelectedBrand(brand)
                      handleToggleDialog('brandDetails')
                    }
                  }}
                >
                  <FaEye className="w-3 h-3" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const brand = brands.find((item) => item.id === id)

                    if (brand) {
                      handleRequestBrandUpdate(brand)
                    }
                  }}
                >
                  <FaPencilAlt className="w-3 h-3" />
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const brand = brands.find((item) => item.id === id)

                    if (brand) {
                      handleRequestBrandDeletion(brand)
                    }
                  }}
                >
                  <FaTrash className="w-3 h-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <CreateBrandAction
        isOpen={dialogsVisibility.createBrand}
        onClose={() => {
          handleToggleDialog('createBrand')
        }}
      />

      <BrandDetails
        brandId={selectedBrand?.id}
        isOpen={dialogsVisibility.brandDetails}
        onClose={() => handleToggleDialog('brandDetails')}
      />

      <UpdateBrandAction
        selectedBrand={selectedBrand}
        isOpen={dialogsVisibility.updateBrand}
        onUpdateBrand={async (updatedBrand) => {
          if (!selectedBrand) return

          await handleUpdateBrand({
            brandId: selectedBrand.id,
            ...updatedBrand,
          })
        }}
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
