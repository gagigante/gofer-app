import { useEffect, useState } from 'react'
import { type FieldValues, type SubmitErrorHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import type * as z from 'zod'
import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/view/components/ui/dialog'
import { Label } from '@/view/components/ui/label'
import { Input } from '@/view/components/ui/input'
import { Textarea } from '@/view/components/ui/textarea'
import { Button } from '@/view/components/ui/button'

import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'
import { useMutateOnUpdateCategory } from '@/view/hooks/mutations/categories'

import { createCategorySchema } from './CreateCategoryAction/schema'

import { type Category } from '@/api/db/schema'

interface UpdateCategoryActionProps {
  isOpen: boolean
  selectedCategory?: Category
  onClose: () => void
}

export function UpdateCategoryAction({ selectedCategory, isOpen, onClose }: UpdateCategoryActionProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)

  const { mutateAsync: mutateOnUpdate } = useMutateOnUpdateCategory()

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
  }, [isOpen])

  async function onSubmit(data: z.infer<typeof createCategorySchema>) {
    if (!user || !selectedCategory) return

    try {
      setIsLoading(true)

      await mutateOnUpdate({
        loggedUserId: user.id,
        categoryId: selectedCategory.id,
        updatedName: data.name,
        updatedDescription: data.description,
      })

      toast({
        title: 'Categoria atualizada com sucesso.',
        duration: 3000,
      })
      onClose()
      reset()
    } catch (error) {
      const err = error as Error

      if (err.message === 'CategoryAlreadyExistsError') {
        toast({
          title: 'Ja existe uma categoria com este nome.',
          duration: 3000,
        })
      }
    } finally {
      setIsLoading(false)
    }
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
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (isLoading) return

        if (!open) {
          onClose()
          reset()
        }
      }}
    >
      <DialogContent className="max-w-[540px]" onKeyDown={(e) => e.stopPropagation()}>
        <form onSubmit={handleSubmit(onSubmit, onSubmitInvalid)}>
          <DialogHeader>
            <DialogTitle>Editar categoria</DialogTitle>
            <VisuallyHidden.Root>
              <DialogDescription>Editar categoria</DialogDescription>
            </VisuallyHidden.Root>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Nome *</Label>
              <Input id="name" placeholder="Nome da categoria" {...register('name')} />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição opcional da categoria"
                rows={5}
                {...register('description')}
              />
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancelar
              </Button>
            </DialogClose>

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
