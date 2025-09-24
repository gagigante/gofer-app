import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Controller, type FieldValues, type SubmitErrorHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import type * as z from 'zod'
import { toast } from 'sonner'

import { Input } from '@/view/components/ui/input'
import { Label } from '@/view/components/ui/label'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/view/components/ui/dialog'
import { Button } from '@/view/components/ui/button'
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from '@/view/components/ui/select'

import { createUserSchema } from './schema'

interface CreateUserActionProps {
  isOpen: boolean
  onCreateUser: (data: z.infer<typeof createUserSchema>) => Promise<void>
  onClose: () => void
}

export const CreateUserAction = ({ isOpen, onCreateUser, onClose }: CreateUserActionProps) => {
  const [isLoading, setIsLoading] = useState(false)

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
    setIsLoading(true)
    await onCreateUser(data)
    reset()
    setIsLoading(false)
  }

  const onSubmitInvalid: SubmitErrorHandler<FieldValues> = (errors) => {
    const errorsList = Object.entries(errors)

    const [, error] = errorsList[0]

    toast(error?.message?.toString())
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
            <DialogTitle>Criar usuário</DialogTitle>
            <VisuallyHidden.Root>
              <DialogDescription>Criar usuário</DialogDescription>
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

            <div className="grid gap-3">
              <Label htmlFor="password">Senha *</Label>
              <Input
                id="password"
                className={`col-span-3 ${errors.password && 'border-red-500'}`}
                placeholder="Senha"
                type="password"
                {...register('password')}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="role" className="text-left">
                Cargo *
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

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancelar
              </Button>
            </DialogClose>

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Adicionar usuário
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
