import React, { useState } from 'react'
import type * as z from 'zod'
import { FaPencilAlt, FaTrash } from 'react-icons/fa'

import { TabsContent } from '@/view/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Button } from '@/view/components/ui/button'

import { UpdateCategoryAction } from './UpdateCategoryAction'
import { DeleteCategoryAction } from './DeleteCategoryAction'

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
  const [isUpdateCategoryDialogOpen, setIsUpdateCategoryDialogOpen] = useState(false)
  const [isDeleteCategoryAlertOpen, setIsDeleteCategoryAlertOpen] = useState(false)

  function handleRequestCategoryUpdate(category: CategoryWithProductsQuantity) {
    setSelectedCategory(category)
    setIsUpdateCategoryDialogOpen(true)
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

          setIsUpdateCategoryDialogOpen(false)
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

          setIsUpdateCategoryDialogOpen(false)
          setSelectedCategory(undefined)
        },
      },
    )
  }

  function handleRequestCategoryDeletion(category: CategoryWithProductsQuantity) {
    setSelectedCategory(category)
    setIsDeleteCategoryAlertOpen(true)
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
          setIsDeleteCategoryAlertOpen(false)
          setSelectedCategory(undefined)
        },
      },
    )
  }

  return (
    <TabsContent value="categories">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Produtos associados</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {categories.map(({ id, name, description, productsQuantity }) => (
            <TableRow key={id}>
              <TableCell>
                <p className="font-medium">{name}</p>
              </TableCell>

              <TableCell className="max-w-[320px]">
                <p className="font-medium">{description || 'N/A'}</p>
              </TableCell>

              <TableCell>
                <p className="font-medium">{productsQuantity}</p>
              </TableCell>

              <TableCell className="flex-nowrap text-right space-x-1.5">
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

      <UpdateCategoryAction
        selectedCategory={selectedCategory}
        isOpen={isUpdateCategoryDialogOpen}
        onUpdateCategory={async (updatedCategory) => {
          if (!selectedCategory) return

          await handleUpdateCategory({
            categoryId: selectedCategory.id,
            ...updatedCategory,
          })
        }}
        onClose={() => {
          setIsUpdateCategoryDialogOpen(false)
        }}
      />

      <DeleteCategoryAction
        isOpen={isDeleteCategoryAlertOpen}
        onDelete={async () => {
          if (!selectedCategory) return

          await handleDeleteCategory(selectedCategory.id)
        }}
        onClose={() => {
          setIsDeleteCategoryAlertOpen(false)
        }}
      />
    </TabsContent>
  )
}
