import { useEffect, useState } from 'react'
import { type FieldValues, type SubmitErrorHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
import type * as z from 'zod'
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
import { Button } from '@/view/components/ui/button'

import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'
import { useMutateOnUpdateBrand } from '@/view/hooks/mutations/brands'

import { createBrandSchema } from './CreateBrandAction/schema'

import { type Brand } from '@/api/db/schema'

interface UpdateBrandActionProps {
  isOpen: boolean
  selectedBrand?: Brand
  onClose: () => void
}

export function UpdateBrandAction({ selectedBrand, isOpen, onClose }: UpdateBrandActionProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)

  const { mutateAsync: mutateOnUpdate } = useMutateOnUpdateBrand()

  const { register, handleSubmit, reset, setValue } = useForm<z.infer<typeof createBrandSchema>>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    setValue('name', selectedBrand?.name ?? '')
  }, [isOpen])

  async function onSubmit(data: z.infer<typeof createBrandSchema>) {
    if (!user || !selectedBrand) return

    try {
      setIsLoading(true)

      await mutateOnUpdate({
        loggedUserId: user.id,
        brandId: selectedBrand.id,
        updatedName: data.name,
      })

      toast({
        title: 'Marca atualizada com sucesso.',
        duration: 3000,
      })
      onClose()
      reset()
    } catch (error) {
      const err = error as Error

      if (err.message === 'BrandAlreadyExistsError') {
        toast({
          title: 'Ja existe uma marca com este nome.',
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
            <DialogTitle>Editar marca</DialogTitle>
            <VisuallyHidden.Root>
              <DialogDescription>Editar marca</DialogDescription>
            </VisuallyHidden.Root>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-3">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" placeholder="Nome da marca" {...register('name')} />
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
