import React, { useEffect } from 'react'
import { Controller, type FieldValues, type SubmitErrorHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type * as z from 'zod'

import { Input } from '@/view/components/ui/input'
import { Label } from '@/view/components/ui/label'
import { Dialog } from '@/view/components/Dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select'

import { useToast } from '@/view/components/ui/use-toast'

import { createUserSchema } from './schema'

interface CreateUserActionProps {
  isOpen: boolean
  onCreateUser: (data: z.infer<typeof createUserSchema>) => Promise<void>
  onClose: () => void
}

export const CreateUserAction = ({ isOpen, onCreateUser, onClose }: CreateUserActionProps) => {
  const { toast } = useToast()

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof createUserSchema>>({
    mode: 'onSubmit',
    defaultValues: {
      name: '',
      password: '',
      role: 'operator',
    },
    resolver: zodResolver(createUserSchema),
  })

  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen])

  async function onSubmit(data: z.infer<typeof createUserSchema>) {
    onCreateUser(data)
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
      title="Adicionar novo usuário"
      onProceed={handleSubmit(onSubmit, onSubmitInvalid)}
      proceedButtonLabel="Adicionar usuário"
      open={isOpen}
      onClose={() => {
        onClose()
      }}
    >
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nome
          </Label>

          <Input
            id="name"
            className={`col-span-3 ${errors.name && 'border-red-500'}`}
            placeholder="Usuário"
            required
            {...register('name')}
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="password" className="text-right">
            Senha
          </Label>

          <Input
            id="password"
            className={`col-span-3 ${errors.password && 'border-red-500'}`}
            placeholder="Senha"
            type="password"
            required
            {...register('password')}
          />
        </div>

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="role" className="text-right">
            Cargo
          </Label>

          <Controller
            name="role"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Select value={value} onValueChange={onChange}>
                <SelectTrigger id="role" className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper">
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="operator">Operador</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
      </div>
    </Dialog>
  )
}
