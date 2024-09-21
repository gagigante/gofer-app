import React, { useState } from 'react'
import { FaPencilAlt, FaTrash } from 'react-icons/fa'

import { TabsContent } from '@/view/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Button } from '@/view/components/ui/button'

import { DeleteCategoryAction } from './DeleteCategoryAction'

import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'
import { useMutateOnDeleteCategory } from '@/view/hooks/mutations/categories'

import { type CategoryWithProductsQuantity } from '..'

interface CategoriesTabProps {
  categories: CategoryWithProductsQuantity[]
  onRequestUpdateCategory: (category: CategoryWithProductsQuantity) => void
}

export function CategoriesTab({ categories, onRequestUpdateCategory }: CategoriesTabProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const { mutateAsync } = useMutateOnDeleteCategory()

  const [selectedCategory, setSelectedCategory] = useState<CategoryWithProductsQuantity>()
  const [isDeleteCategoryAlertOpen, setIsDeleteCategoryAlertOpen] = useState(false)

  function handleRequestUserDeletion(category: CategoryWithProductsQuantity) {
    setSelectedCategory(category)
    setIsDeleteCategoryAlertOpen(true)
  }

  async function handleDeleteCategory(categoryId: string) {
    if (!user) return

    await mutateAsync(
      { loggedUserId: user.id, categoryId },
      {
        onSuccess: () => {
          toast({
            title: 'Categoria removido com sucesso.',
            duration: 3000,
          })
        },
        onError: () => {
          toast({
            title: 'Houve um erro ao apagar o usuário. Tente novamente.',
            duration: 3000,
          })
        },
        onSettled: () => {
          setIsDeleteCategoryAlertOpen(false)
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
                      onRequestUpdateCategory(category)
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
                      handleRequestUserDeletion(category)
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
