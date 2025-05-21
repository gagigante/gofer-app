import { useFormContext } from 'react-hook-form'

import { FormField } from '@/view/components/ui/form'
import { Label } from '@/view/components/ui/label'
import { Textarea } from '@/view/components/ui/textarea'

import { type CreateOrderSchema } from '../schema'

export function ObsFormSection() {
  const { control } = useFormContext<CreateOrderSchema>()

  return (
    <div className="grid w-full space-y-2 my-4">
      <FormField
        control={control}
        name="obs"
        render={({ field }) => (
          <>
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              placeholder="Adicione observações ao pedido"
              {...field}
              onKeyDown={(e) => e.stopPropagation()}
            />
          </>
        )}
      />
    </div>
  )
}
