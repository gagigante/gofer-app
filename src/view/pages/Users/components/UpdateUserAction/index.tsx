import { useEffect, useState } from 'react'
import { type FieldValues, type SubmitErrorHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import type * as z from 'zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/view/components/ui/button'
import { Input } from '@/view/components/ui/input'
import { Label } from '@/view/components/ui/label'
import { Separator } from '@/view/components/ui/separator'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/view/components/ui/dialog'

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

  const [isLoading, setIsLoading] = useState(false)

  const {
    setValue,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<z.infer<typeof updateUserSchema>>({
    resolver: zodResolver(updateUserSchema),
  })

  useEffect(() => {
    setValue('name', selectedUserName)
  }, [selectedUserName])

  async function onSubmit(data: z.infer<typeof updateUserSchema>) {
    setIsLoading(true)
    await onUpdateUser(data)
    reset()
    setIsLoading(false)
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
            <DialogTitle>Editar usuário</DialogTitle>
            <VisuallyHidden.Root>
              <DialogDescription>Editar usuário</DialogDescription>
            </VisuallyHidden.Root>
          </DialogHeader>

          <div className="grid gap-4 py-8">
            <div className="grid gap-3">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                className={`col-span-3 ${errors.name && 'border-red-500'}`}
                placeholder="Usuário"
                {...register('name')}
              />
            </div>

            <Separator />

            <div className="grid gap-3">
              <Label htmlFor="password" className="text-left">
                Senha atual
              </Label>
              <Input
                id="password"
                type="password"
                className={`col-span-3 ${errors.password && 'border-red-500'}`}
                {...register('password')}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="newPassword" className="text-left">
                Nova senha
              </Label>
              <Input
                id="newPassword"
                type="password"
                className={`col-span-3 ${errors.newPassword && 'border-red-500'}`}
                {...register('newPassword')}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="newPasswordConfirmation" className="text-left">
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
