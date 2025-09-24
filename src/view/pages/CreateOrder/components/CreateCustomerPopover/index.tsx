import { useState } from 'react'
import { type FieldValues, type SubmitErrorHandler, useForm } from 'react-hook-form'
import type * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { FormField } from '@/view/components/ui/form'
import { Button } from '@/view/components/ui/button'
import { Input } from '@/view/components/ui/input'
import { Label } from '@/view/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/view/components/ui/popover'

import { useAuth } from '@/view/hooks/useAuth'
import { useMutateOnCreateCustomer } from '@/view/hooks/mutations/customers'

import { formatPhone } from '@/view/utils/formatters'
import { createCustomerSchema } from './schema'

interface CreateCustomerPopoverProps {
  onCreateCustomer: (id: string, name: string) => void
}

export function CreateCustomerPopover({ onCreateCustomer }: CreateCustomerPopoverProps) {
  const { user } = useAuth()

  const { mutateAsync, status } = useMutateOnCreateCustomer()

  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const { control, register, handleSubmit, reset } = useForm<z.infer<typeof createCustomerSchema>>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: '',
      phone: '',
    },
  })

  async function onSubmit(value: z.infer<typeof createCustomerSchema>) {
    if (!user) return

    await mutateAsync(
      { loggedUserId: user.id, ...value },
      {
        onSuccess: (response) => {
          if (!response?.id) return

          onCreateCustomer(response.id, response.name!)

          toast('Cliente cadastrado com sucesso.')

          setIsPopoverOpen(false)
          reset()
        },
        onError: () => {
          toast('Houve um erro ao criar o cliente. Tente novamente.')
        },
      },
    )
  }

  const onSubmitInvalid: SubmitErrorHandler<FieldValues> = (errors) => {
    const errorsList = Object.entries(errors)

    const [, error] = errorsList[0]

    toast(error?.message?.toString())
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
            <Label htmlFor="name">Nome *</Label>
            <Input id="name" className="col-span-3 h-8" placeholder="Nome do cliente" {...register('name')} />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <FormField
              control={control}
              name="phone"
              render={({ field: { value, onChange, ...rest } }) => (
                <>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    className="col-span-3 h-8"
                    placeholder="Telefone do cliente"
                    value={formatPhone(value ?? '')}
                    onChange={(e) => {
                      const formatted = formatPhone(e.target.value)
                      e.target.value = formatted
                      onChange(formatted)
                    }}
                    {...rest}
                  />
                </>
              )}
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

            <Button onClick={handleSubmit(onSubmit, onSubmitInvalid)} disabled={status === 'pending'}>
              {status === 'pending' && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
              Adicionar
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
