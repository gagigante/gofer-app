import React from 'react'
import { type FieldValues, type SubmitErrorHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type * as z from 'zod'

import { Label } from '@/view/components/ui/label'
import { Input } from '@/view/components/ui/input'
import { Textarea } from '@/view/components/ui/textarea'
import { Dialog } from '@/view/components/Dialog'

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

    await mutateAsync(
      {
        loggedUserId: user.id,
        name: data.name,
        description: data.description,
      },
      {
        onError: (err) => {
          if (err.message === 'CategoryAlreadyExistsError') {
            toast({
              title: 'Ja existe uma categoria com este nome.',
              duration: 3000,
            })
          }
        },
        onSuccess: () => {
          onClose()
          reset()
        },
      },
    )
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
      title="Criar categoria"
      onProceed={handleSubmit(onSubmit, onSubmitInvalid)}
      proceedButtonLabel="Adicionar categoria"
      open={isOpen}
      onClose={() => {
        onClose()
        reset()
      }}
    >
      <div className="flex flex-col gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nome *
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
            {...register('description')}
          />
        </div>
      </div>
    </Dialog>
  )
}
