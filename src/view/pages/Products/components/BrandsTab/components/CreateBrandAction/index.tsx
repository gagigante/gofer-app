import { useState } from 'react'
import { type FieldValues, type SubmitErrorHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type * as z from 'zod'
import * as VisuallyHidden from '@radix-ui/react-visually-hidden'
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

import { useToast } from '@/view/components/ui/use-toast'
import { useAuth } from '@/view/hooks/useAuth'
import { useMutateOnCreateBrand } from '@/view/hooks/mutations/brands'

import { createBrandSchema } from './schema'

interface CreateBrandActionProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateBrandAction({ isOpen, onClose }: CreateBrandActionProps) {
  const { user } = useAuth()
  const { toast } = useToast()

  const [isLoading, setIsLoading] = useState(false)

  const { mutateAsync } = useMutateOnCreateBrand()

  const { register, handleSubmit, reset } = useForm<z.infer<typeof createBrandSchema>>({
    resolver: zodResolver(createBrandSchema),
    defaultValues: {
      name: '',
    },
  })

  async function onSubmit(data: z.infer<typeof createBrandSchema>) {
    if (!user) return

    try {
      setIsLoading(true)

      await mutateAsync({ loggedUserId: user.id, name: data.name })

      toast({
        title: 'Marca criada com sucesso.',
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
            <DialogTitle>Criar marca</DialogTitle>
            <VisuallyHidden.Root>
              <DialogDescription>Criar marca</DialogDescription>
            </VisuallyHidden.Root>
          </DialogHeader>

          <div className="grid gap-4 py-8">
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
              Adicionar marca
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
