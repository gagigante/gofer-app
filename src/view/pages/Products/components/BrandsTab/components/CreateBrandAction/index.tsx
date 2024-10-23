import { type FieldValues, type SubmitErrorHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type * as z from 'zod'

import { Label } from '@/view/components/ui/label'
import { Input } from '@/view/components/ui/input'
import { Dialog } from '@/view/components/Dialog'

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

  const { mutateAsync } = useMutateOnCreateBrand()

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
              title: 'Ja existe uma marca com este nome.',
              duration: 3000,
            })
          }
        },
        onSuccess: () => {
          onClose()
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
    <Dialog
      title="Criar marca"
      onProceed={handleSubmit(onSubmit, onSubmitInvalid)}
      proceedButtonLabel="Adicionar marca"
      open={isOpen}
      onClose={() => {
        onClose()
        reset()
      }}
    >
      <div className="flex flex-col gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="name" className="text-right">
            Nome *
          </Label>
          <Input id="name" placeholder="Nome do produto" className="col-span-3" required {...register('name')} />
        </div>
      </div>
    </Dialog>
  )
}
