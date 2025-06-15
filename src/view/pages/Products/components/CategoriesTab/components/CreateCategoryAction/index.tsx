import { useState } from 'react'
import { type FieldValues, type SubmitErrorHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type * as z from 'zod'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
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

import { useToast } from '@/view/components/ui/use-toast'
import { useAuth } from '@/view/hooks/useAuth'
import { useMutateOnCreateCategory } from '@/view/hooks/mutations/categories'

import { createCategorySchema } from './schema'

interface CreateCategoryActionProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateCategoryAction({ isOpen, onClose }: CreateCategoryActionProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)

  const { mutateAsync } = useMutateOnCreateCategory()

  const { register, handleSubmit, reset } = useForm<z.infer<typeof createCategorySchema>>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  async function onSubmit(data: z.infer<typeof createCategorySchema>) {
    if (!user) return

    try {
      setIsLoading(true)

      await mutateAsync({
        loggedUserId: user.id,
        name: data.name,
        description: data.description,
      })

      toast({
        title: 'Categoria criada com sucesso.',
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
            <DialogTitle>Criar categoria</DialogTitle>
            <VisuallyHidden.Root>
              <DialogDescription>Criar categoria</DialogDescription>
            </VisuallyHidden.Root>
          </DialogHeader>

          <div className="grid gap-4 py-8">
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
              Adicionar categoria
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
