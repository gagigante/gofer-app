import React, { useEffect } from 'react'
import { type FieldValues, type SubmitErrorHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type * as z from 'zod'

import { Input } from '@/view/components/ui/input'
import { Label } from '@/view/components/ui/label'
import { Separator } from '@/view/components/ui/separator'
import { Dialog } from '@/view/components/Dialog'

import { useToast } from '@/view/components/ui/use-toast'

import { updateUserSchema } from './schema'

interface UpdateUserActionProps {
  isOpen: boolean
  selectedUserName: string
  onUpdateUser: (data: z.infer<typeof updateUserSchema>) => Promise<void>
  onClose: () => void
}

export const UpdateUserAction = ({ isOpen, selectedUserName, onUpdateUser, onClose }: UpdateUserActionProps) => {
  const { toast } = useToast()

  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
  })

  useEffect(() => {
    setValue('name', selectedUserName)
  }, [selectedUserName])

  async function onSubmit(data: z.infer<typeof updateUserSchema>) {
    onUpdateUser(data)
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
      title="Editar usuário"
      onProceed={handleSubmit(onSubmit, onSubmitInvalid)}
      proceedButtonLabel="Salvar"
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
          <Input id="name" className={`col-span-3 ${errors.name && 'border-red-500'}`} required {...register('name')} />
        </div>

        <Separator />

        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="password" className="text-right">
            Senha atual
          </Label>
          <Input
            id="password"
            type="password"
            className={`col-span-3 ${errors.password && 'border-red-500'}`}
            {...register('password')}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="newPassword" className="text-right">
            Nova senha
          </Label>
          <Input
            id="newPassword"
            type="password"
            className={`col-span-3 ${errors.newPassword && 'border-red-500'}`}
            {...register('newPassword')}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="newPasswordConfirmation" className="text-right">
            Confirmar nova senha
          </Label>
          <Input
            id="newPasswordConfirmation"
            type="password"
            className={`col-span-3 ${errors.newPasswordConfirmation && 'border-red-500'}`}
            {...register('newPasswordConfirmation')}
          />
        </div>
      </div>
    </Dialog>
  )
}
