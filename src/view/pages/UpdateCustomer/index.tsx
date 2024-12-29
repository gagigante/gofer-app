import { Link, useLocation, useNavigate } from 'react-router-dom'
import type * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Form } from '@/view/components/ui/form'
import { Button } from '@/view/components/ui/button'
import { CustomerForm } from '../CreateCustomer/components/CustomerForm'

import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'
import { useMutateOnUpdateCustomer } from '@/view/hooks/mutations/customers'

import { createCustomerSchema } from '../CreateCustomer/schema'

import { type Customer } from '@/api/db/schema'

export function UpdateCustomer() {
  const {
    state: { selectedCustomer },
  } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const { mutateAsync } = useMutateOnUpdateCustomer()

  const form = useForm<z.infer<typeof createCustomerSchema>>({
    resolver: zodResolver(createCustomerSchema),
    defaultValues: {
      name: '',
      rg: '',
      cpf: '',
      cnpj: '',
      ie: '',
      email: '',
      phone: '',
      zipcode: '',
      city: '',
      street: '',
      neighborhood: '',
      complement: '',
    },
  })

  const customer = selectedCustomer as Customer

  async function onSubmit(values: z.infer<typeof createCustomerSchema>) {
    if (!user) return

    await mutateAsync(
      { loggedUserId: user.id, id: customer.id, ...values },
      {
        onSuccess: () => {
          toast({
            title: 'Cliente atualizado com sucesso.',
            duration: 3000,
          })

          navigate('..', { relative: 'path' })
        },
        onError: () => {
          // TODO: custom errors

          toast({
            title: 'Houve um erro ao atualizar este cliente. Tente novamente.',
            duration: 3000,
          })
        },
      },
    )
  }

  return (
    <Form {...form}>
      <form className="h-full flex flex-col" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex-1 px-3 py-6 overflow-auto">
          <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Atualizar cliente</h2>

          <CustomerForm form={form} defaultValue={customer} />
        </div>

        <footer className="flex px-3 py-4 border-t border-border">
          <div className="flex gap-2 ml-auto">
            <Button type="submit">Atualizar cliente</Button>

            <Button variant="outline" asChild>
              <Link to=".." relative="path">
                Cancelar
              </Link>
            </Button>
          </div>
        </footer>
      </form>
    </Form>
  )
}
