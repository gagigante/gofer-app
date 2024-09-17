import React, { useEffect } from 'react'
import { type Category } from '@prisma/client'
import { type FieldValues, type SubmitErrorHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type * as z from 'zod'

import { Label } from '@/view/components/ui/label'
import { Input } from '@/view/components/ui/input'
import { Textarea } from '@/view/components/ui/textarea'
import { Dialog } from '@/view/components/Dialog'

import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'

import { createCategorySchema } from './CreateCategoryAction/schema'

import { type apiName, type CategoriesApi } from '@/api/exposes/categories-api'

interface UpdateCategoryActionProps {
  isOpen: boolean
  selectedCategory?: Category
  onUpdateCategory: (data: Category) => Promise<void>
  onClose: () => void
}

export function UpdateCategoryAction({
  selectedCategory,
  isOpen,
  onUpdateCategory,
  onClose,
}: UpdateCategoryActionProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const { register, handleSubmit, reset, setValue } = useForm<z.infer<typeof createCategorySchema>>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  useEffect(() => {
    setValue('name', selectedCategory?.name ?? '')
    setValue('description', selectedCategory?.description ?? '')
  }, [selectedCategory])

  async function onSubmit(data: z.infer<typeof createCategorySchema>) {
    if (!user || !selectedCategory) return

    const { data: response, err } = await (
      window as unknown as Record<typeof apiName, CategoriesApi>
    ).categoriesApi.update({
      loggedUserId: user.id,
      categoryId: selectedCategory.id,
      updatedName: data.name,
      updatedDescription: data.description,
    })

    if (err) {
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
      return
    }

    onUpdateCategory(response)
    onClose()
    reset()
  }

  const onSubmitInvalid: SubmitErrorHandler<FieldValues> = (errors) => {
    const errorsList = Object.entries(errors)

    const [, error] = errorsList[0]

    toast({
      title: error?.message?.toString(),
      duration: 3000,
    })
  }

  return (
    <Dialog
      title="Editar categoria"
      onProceed={handleSubmit(onSubmit, onSubmitInvalid)}
      proceedButtonLabel="Salvar"
      open={isOpen}
      onClose={() => {
        onClose()
        reset()
      }}
    >
      <div className="flex flex-col gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nome
          </Label>
          <Input id="name" placeholder="Nome do produto" className="col-span-3" required {...register('name')} />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Descrição
          </Label>
          <Textarea
            id="description"
            placeholder="Descrição opcional da categoria"
            className="col-span-3"
            rows={5}
            required
            {...register('description')}
          />
        </div>
      </div>
    </Dialog>
  )
}
