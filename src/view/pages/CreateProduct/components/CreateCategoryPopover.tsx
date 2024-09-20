import React, { useState } from 'react'
import { type FieldValues, type SubmitErrorHandler, useForm } from 'react-hook-form'
import type * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'

import { Button } from '@/view/components/ui/button'
import { Input } from '@/view/components/ui/input'
import { Label } from '@/view/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/view/components/ui/popover'
import { Textarea } from '@/view/components/ui/textarea'

import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'

import { type apiName, type CategoriesApi } from '@/api/exposes/categories-api'
import { createCategorySchema } from '../../Products/components/CreateCategoryAction/schema'

export function CreateCategoryPopover() {
  const { user } = useAuth()
  const { toast } = useToast()

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { register, handleSubmit, reset } = useForm<z.infer<typeof createCategorySchema>>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  async function onSubmit(data: z.infer<typeof createCategorySchema>) {
    if (!user) return

    const { err } = await (window as unknown as Record<typeof apiName, CategoriesApi>).categoriesApi.create({
      loggedUserId: user.id,
      name: data.name,
      description: data.description,
    })

    if (!err) {
      setIsPopoverOpen(false)
      reset()
      return
    }

    if (err.message === 'CategoryAlreadyExistsError') {
      toast({
        title: 'Ja existe uma categoria com este nome.',
        duration: 3000,
      })
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
    <Popover
      open={isPopoverOpen}
      onOpenChange={(isOpen) => {
        setIsPopoverOpen(isOpen)
      }}
    >
      <PopoverTrigger asChild>
        <Button className="aspect-square p-0" variant="outline">
          <Plus />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-84">
        <div className="flex flex-col gap-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium leading-none">Criar categoria</h4>
            <p className="text-sm text-muted-foreground">Preencha o formulário abaixo para criar uma nova categoria</p>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" className="col-span-3 h-8" placeholder="Nome da categoria" {...register('name')} />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="Descrição opcional da categoria"
              className="col-span-3"
              rows={5}
              {...register('description')}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsPopoverOpen(false)
                reset()
              }}
            >
              Cancelar
            </Button>

            <Button onClick={handleSubmit(onSubmit, onSubmitInvalid)}>Adicionar</Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
