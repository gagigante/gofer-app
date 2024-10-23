import { useEffect } from 'react'
import { type FieldValues, type SubmitErrorHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import type * as z from 'zod'

import { Label } from '@/view/components/ui/label'
import { Input } from '@/view/components/ui/input'
import { Dialog } from '@/view/components/Dialog'

import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'

import { createBrandSchema } from './CreateBrandAction/schema'

import { type Brand } from '@/api/db/schema'

interface UpdateBrandActionProps {
  isOpen: boolean
  selectedBrand?: Brand
  onUpdateBrand: (data: z.infer<typeof createBrandSchema>) => Promise<void>
  onClose: () => void
}

export function UpdateBrandAction({
  selectedBrand,
  isOpen,
  onUpdateBrand,
  onClose,
}: UpdateBrandActionProps) {
  const { user } = useAuth()
  const { toast } = useToast()

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

    onUpdateBrand(data)
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
      title="Editar marca"
      onProceed={handleSubmit(onSubmit, onSubmitInvalid)}
      proceedButtonLabel="Salvar"
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
