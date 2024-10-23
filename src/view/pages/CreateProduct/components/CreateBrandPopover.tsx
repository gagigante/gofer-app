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
import { useMutateOnCreateBrand } from '@/view/hooks/mutations/brands'

import { createBrandSchema } from '../../Products/components/BrandsTab/components/CreateBrandAction/schema'

export function CreateBrandPopover() {
  const { user } = useAuth()
  const { toast } = useToast()

  const { mutateAsync } = useMutateOnCreateBrand()

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { register, handleSubmit, reset } = useForm<z.infer<typeof createBrandSchema>>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: {
      name: '',
    },
  })

  async function onSubmit(data: z.infer<typeof createBrandSchema>) {
    if (!user) return

    await mutateAsync(
      {
        loggedUserId: user.id,
        name: data.name,
      },
      {
        onError: (err) => {
          if (err.message === 'BrandAlreadyExistsError') {
            toast({
              title: 'Já existe uma marca com este nome.',
              duration: 3000,
            })
          }
        },
        onSuccess: () => {
          toast({
            title: 'Marca criada com sucesso.',
            duration: 3000,
          })

          setIsPopoverOpen(false)
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
            <h4 className="font-medium leading-none">Criar marca</h4>
            <p className="text-sm text-muted-foreground">Preencha o formulário abaixo para criar uma nova marca</p>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" className="col-span-3 h-8" placeholder="Nome da marca" {...register('name')} />
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
