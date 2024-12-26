import { useState } from 'react'
import { type FieldValues, type SubmitErrorHandler, useForm } from 'react-hook-form'
import type * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus } from 'lucide-react'

import { Button } from '@/view/components/ui/button'
import { Input } from '@/view/components/ui/input'
import { Label } from '@/view/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/view/components/ui/popover'

import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'
import { useMutateOnCreateCustomer } from '@/view/hooks/mutations/customers'

import { createCustomerSchema } from './schema'

export function CreateCustomerPopover() {
  const { user } = useAuth()
  const { toast } = useToast()

  const { mutateAsync } = useMutateOnCreateCustomer()

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { register, handleSubmit, reset } = useForm<z.infer<typeof createCustomerSchema>>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: '',
    },
  })

  async function onSubmit(value: z.infer<typeof createCustomerSchema>) {
    if (!user) return

    await mutateAsync(
      { loggedUserId: user.id, ...value },
      {
        onSuccess: () => {
          toast({
            title: 'Cliente cadastrado com sucesso.',
            duration: 3000,
          })

          setIsPopoverOpen(false)
          reset()
        },
        onError: () => {
          toast({
            title: 'Houve um erro ao criar o cliente. Tente novamente.',
            duration: 3000,
          })
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
            <h4 className="font-medium leading-none">Criar cliente</h4>
            <p className="text-sm text-muted-foreground">Preencha o formulário abaixo para criar um nova cliente</p>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" className="col-span-3 h-8" placeholder="Nome do cliente" {...register('name')} />
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
