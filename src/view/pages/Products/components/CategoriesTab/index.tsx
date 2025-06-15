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
import { CreateCategoryAction } from './components/CreateCategoryAction'
import { UpdateCategoryAction } from './components/UpdateCategoryAction'
import { DeleteCategoryAction } from './components/DeleteCategoryAction'
import { CategoryDetails } from './components/CategoryDetails'

import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'
import { useMutateOnDeleteCategory } from '@/view/hooks/mutations/categories'

import { type CategoryWithProductsQuantity } from '../..'

interface CategoriesTabProps {
  categories: CategoryWithProductsQuantity[]
  isFetching: boolean
  onChangeFilter: (nameFilter: string) => void
  onDelete: () => void
}

export function CategoriesTab({ categories, isFetching, onChangeFilter, onDelete }: CategoriesTabProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const { mutateAsync: mutateOnDelete } = useMutateOnDeleteCategory()

  const [selectedCategory, setSelectedCategory] = useState<CategoryWithProductsQuantity>()
  const [dialogsVisibility, setDialogsVisibility] = useState({
    createCategory: false,
    categoryDetails: false,
    updateCategory: false,
    deleteCategory: false,
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

  function handleRequestCategoryUpdate(category: CategoryWithProductsQuantity) {
    setSelectedCategory(category)
    handleToggleDialog('updateCategory')
  }

  function handleRequestCategoryDeletion(category: CategoryWithProductsQuantity) {
    setSelectedCategory(category)
    handleToggleDialog('deleteCategory')
  }

  async function handleDeleteCategory(categoryId: string) {
    if (!user) return

    try {
      await mutateOnDelete({ loggedUserId: user.id, categoryId })

      toast({
        title: 'Categoria removida com sucesso.',
        duration: 3000,
      })
    } catch {
      toast({
        title: 'Houve um erro ao apagar a categoria. Tente novamente.',
        duration: 3000,
      })
    } finally {
      setSelectedCategory(undefined)
      onDelete()
    }
  }

  return (
    <TabsContent value="categories">
      <div className="flex justify-end items-center my-4">
        <Button onClick={() => handleToggleDialog('createCategory')}>Adicionar categoria</Button>
      </div>

      <Input
        className="mb-4"
        placeholder="Buscar por nome da categoria"
        value={nameFilter}
        onChange={(e) => {
          setNameFilter(e.target.value)
        }}
      />

      {isFetching && <TableLoading columns={3} rows={5} />}

      {!isFetching && (
        <Table>
          {categories.length === 0 && <TableCaption>Nenhuma categoria encontrada.</TableCaption>}

          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="min-w-[164px]">Produtos associados</TableHead>
              <TableHead className="min-w-[160px]"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {categories.map(({ id, name, description, products }) => (
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
                      <p className="font-medium line-clamp-1">{description || 'N/A'}</p>
                    </TooltipTrigger>

                    <TooltipContent>
                      <p>{description || 'N/A'}</p>
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
                    tooltip="Ver detalhes da categoria"
                    onClick={() => {
                      const category = categories.find((item) => item.id === id)
                      if (category) {
                        setSelectedCategory(category)
                        handleToggleDialog('categoryDetails')
                      }
                    }}
                  />

                  <TableActionButton
                    icon={<Pencil className="w-3 h-3" />}
                    variant="outline"
                    tooltip="Editar categoria"
                    onClick={() => {
                      const category = categories.find((item) => item.id === id)

                      if (category) {
                        handleRequestCategoryUpdate(category)
                      }
                    }}
                  />

                  <TableActionButton
                    icon={<Trash2 className="w-3 h-3" />}
                    variant="destructive"
                    tooltip="Apagar categoria"
                    onClick={() => {
                      const category = categories.find((item) => item.id === id)

                      if (category) {
                        handleRequestCategoryDeletion(category)
                      }
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <CategoryDetails
        categoryId={selectedCategory?.id}
        isOpen={dialogsVisibility.categoryDetails}
        onClose={() => handleToggleDialog('categoryDetails')}
      />

      <CreateCategoryAction
        isOpen={dialogsVisibility.createCategory}
        onClose={() => {
          handleToggleDialog('createCategory')
        }}
      />

      <UpdateCategoryAction
        selectedCategory={selectedCategory}
        isOpen={dialogsVisibility.updateCategory}
        onClose={() => {
          handleToggleDialog('updateCategory')
        }}
      />

      <DeleteCategoryAction
        isOpen={dialogsVisibility.deleteCategory}
        onDelete={async () => {
          if (!selectedCategory) return

          await handleDeleteCategory(selectedCategory.id)
        }}
        onClose={() => {
          handleToggleDialog('deleteCategory')
        }}
      />
    </TabsContent>
  )
}
