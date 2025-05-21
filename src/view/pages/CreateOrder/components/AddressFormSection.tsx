import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import { Loader2 } from 'lucide-react'

import { Card } from '@/view/components/ui/card'
import { Input } from '@/view/components/ui/input'
import { FormItem, FormField, FormLabel, FormControl, FormMessage } from '@/view/components/ui/form'

import { useCustomer } from '@/view/hooks/queries/customers'
import { useAuth } from '@/view/hooks/useAuth'

import { type CreateOrderSchema } from '../schema'

export function AddressFormSection() {
  const { user } = useAuth()
  const { control, watch, setValue } = useFormContext<CreateOrderSchema>()

  const customerId = watch('customer')

  const { data: customer, isFetching } = useCustomer(
    { loggedUserId: user?.id ?? '', customerId: customerId?.id ?? '' },
    {
      enabled: !!customerId && !!user,
    },
  )

  useEffect(() => {
    setValue('city', customer?.city ?? '', { shouldDirty: false })
    setValue('complement', customer?.complement ?? '', { shouldDirty: false })
    setValue('street', customer?.street ?? '', { shouldDirty: false })
    setValue('zipcode', customer?.zipcode ?? '', { shouldDirty: false })
    setValue('neighborhood', customer?.neighborhood ?? '', { shouldDirty: false })
  }, [customer])

  return (
    <>
      <h3 className="mt-8 mb-4 text-lg font-semibold">Endereço da entrega</h3>

      <Card className="relative p-4 overflow-hidden">
        <div className="flex gap-4 mb-4">
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

        {isFetching && (
          <div className="absolute m-0 top-0 right-0 bottom-0 left-0 flex items-center justify-center backdrop-blur-md bg-muted/20 border border-muted/10 shadow-lg">
            <Loader2 className="animate-spin w-4 h-4 mr-2" />
            Buscando endereço do cliente...
          </div>
        )}
      </Card>
    </>
  )
}
