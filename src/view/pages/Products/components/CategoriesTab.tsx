import { useState } from 'react'
import type * as z from 'zod'
import { FaEye, FaPencilAlt, FaTrash } from 'react-icons/fa'

import { TabsContent } from '@/view/components/ui/tabs'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Button } from '@/view/components/ui/button'

import { UpdateCategoryAction } from './UpdateCategoryAction'
import { DeleteCategoryAction } from './DeleteCategoryAction'
import { CategoryDetails } from './CategoryDetails'

import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'
import { useMutateOnDeleteCategory, useMutateOnUpdateCategory } from '@/view/hooks/mutations/categories'

import { type CategoryWithProductsQuantity } from '..'
import { type createCategorySchema } from './CreateCategoryAction/schema'

interface CategoriesTabProps {
  categories: CategoryWithProductsQuantity[]
  onDelete: () => void
}

export function CategoriesTab({ categories, onDelete }: CategoriesTabProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const { mutateAsync: mutateOnUpdate } = useMutateOnUpdateCategory()
  const { mutateAsync: mutateOnDelete } = useMutateOnDeleteCategory()

  const [selectedCategory, setSelectedCategory] = useState<CategoryWithProductsQuantity>()

  const [dialogsVisibility, setDialogsVisibility] = useState({
    categoryDetails: false,
    updateCategory: false,
    deleteCategory: false,
  })

  function handleToggleDialog(dialog: keyof typeof dialogsVisibility) {
    setDialogsVisibility(prevState => ({
      ...prevState,
      [dialog]: !prevState[dialog]
    }))
  }

  function handleRequestCategoryUpdate(category: CategoryWithProductsQuantity) {
    setSelectedCategory(category)
    handleToggleDialog('updateCategory')
  }

  async function handleUpdateCategory(data: z.infer<typeof createCategorySchema> & { categoryId: string }) {
    if (!user) return

    await mutateOnUpdate(
      {
        loggedUserId: user.id,
        categoryId: data.categoryId,
        updatedName: data.name,
        updatedDescription: data.description,
      },
      {
        onSuccess: () => {
          toast({
            title: 'Categoria atualizada com sucesso.',
            duration: 3000,
          })

          handleToggleDialog('updateCategory')
          setSelectedCategory(undefined)
        },
        onError: (err) => {
          if (err.message === 'CategoryAlreadyExistsError') {
            toast({
              title: 'Ja existe uma categoria com este nome.',
              duration: 3000,
            })
            return
          }

          toast({
            title: 'Houve um erro ao apagar o usuário. Tente novamente.',
            duration: 3000,
          })

          handleToggleDialog('updateCategory')
          setSelectedCategory(undefined)
        },
      },
    )
  }

  function handleRequestCategoryDeletion(category: CategoryWithProductsQuantity) {
    setSelectedCategory(category)
    handleToggleDialog('deleteCategory')
  }

  async function handleDeleteCategory(categoryId: string) {
    if (!user) return

    await mutateOnDelete(
      { loggedUserId: user.id, categoryId },
      {
        onSuccess: () => {
          toast({
            title: 'Categoria removida com sucesso.',
            duration: 3000,
          })
          onDelete()
        },
        onError: () => {
          toast({
            title: 'Houve um erro ao apagar o usuário. Tente novamente.',
            duration: 3000,
          })
        },
        onSettled: () => {
          handleToggleDialog('deleteCategory')
          setSelectedCategory(undefined)
        },
      },
    )
  }

  return (
    <TabsContent value="categories">
      <Table>
        {categories.length === 0 && <TableCaption>Nenhuma categoria encontrada.</TableCaption>}

        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Produtos associados</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.map(({ id, name, description, products }) => (
            <TableRow key={id}>
              <TableCell>
                <p className="font-medium">{name}</p>
              </TableCell>

              <TableCell className="max-w-[320px]">
                <p className="font-medium">{description || 'N/A'}</p>
              </TableCell>

              <TableCell>
                <p className="font-medium">{products}</p>
              </TableCell>

              <TableCell className="flex-nowrap text-right space-x-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const category = categories.find((item) => item.id === id)
                    if (category) {
                      setSelectedCategory(category)
                      handleToggleDialog('categoryDetails')
                    }
                  }}
                >
                  <FaEye className="w-3 h-3" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const category = categories.find((item) => item.id === id)

                    if (category) {
                      handleRequestCategoryUpdate(category)
                    }
                  }}
                >
                  <FaPencilAlt className="w-3 h-3" />
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    const category = categories.find((item) => item.id === id)

                    if (category) {
                      handleRequestCategoryDeletion(category)
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

      <CategoryDetails
        categoryId={selectedCategory?.id}
        isOpen={dialogsVisibility.categoryDetails}
        onClose={() => handleToggleDialog('categoryDetails')}
      />

      <UpdateCategoryAction
        selectedCategory={selectedCategory}
        isOpen={dialogsVisibility.updateCategory}
        onUpdateCategory={async (updatedCategory) => {
          if (!selectedCategory) return

          await handleUpdateCategory({
            categoryId: selectedCategory.id,
            ...updatedCategory,
          })
        }}
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
