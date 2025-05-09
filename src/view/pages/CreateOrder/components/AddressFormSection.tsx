import * as z from 'zod'

import { Card } from '@/view/components/ui/card'
import { Input } from '@/view/components/ui/input'
import { FormItem, FormField, FormLabel, FormControl, FormMessage } from '@/view/components/ui/form'

import { useFormContext } from 'react-hook-form'

import { createOrderSchema } from '../schema'

export function AddressFormSection() {
  const { control } = useFormContext<z.infer<typeof createOrderSchema>>()

  return (
    <Card className="p-4 space-y-4">
      <div className="flex gap-4">
        <FormField
          control={control}
          name="zipcode"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>CEP</FormLabel>
              <FormControl>
                <Input placeholder="Digite o CEP para entrega do pedido" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Cidade</FormLabel>
              <FormControl>
                <Input placeholder="Digite a cidade para entrega do pedido" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="flex gap-4">
        <FormField
          control={control}
          name="street"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Logradouro</FormLabel>
              <FormControl>
                <Input placeholder="Digite o logradouro para entrega do pedido" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="neighborhood"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Bairro</FormLabel>
              <FormControl>
                <Input placeholder="Digite o bairro para entrega do pedido" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="complement"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Complemento</FormLabel>
              <FormControl>
                <Input placeholder="Digite o complemento para entrega do pedido" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Card>
  )
}
