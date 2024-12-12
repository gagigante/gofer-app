import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import type * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import { Form } from '@/view/components/ui/form'
import { Button } from '@/view/components/ui/button'
import { CustomerForm } from './components/CustomerForm'

import { useToast } from '@/view/components/ui/use-toast'
import { useAuth } from '@/view/hooks/useAuth'
import { useMutateOnCreateCustomer } from '@/view/hooks/mutations/customers'

import { createCustomerSchema } from './schema'

export function CreateCustomer() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const { mutateAsync } = useMutateOnCreateCustomer()

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

  async function onSubmit(value: z.infer<typeof createCustomerSchema>) {
    if (!user) return

    await mutateAsync(
      { loggedUserId: user.id, ...value },
      {
        onSuccess: () => {
          toast({
            title: 'Cliente cadastrado com sucesso.',
            duration: 3000,
          })

          navigate('..', { relative: 'path' })
        },
      },
    )
  }

  return (
    <Form {...form}>
      <form className="h-full flex flex-col" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex-1 px-3 py-6 overflow-auto">
          <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Criar cliente</h2>

          <CustomerForm form={form} />
        </div>

        <footer className="flex px-3 py-4 border-t border-border">
          <div className="flex gap-2 ml-auto">
            <Button type="submit">Adicionar cliente</Button>

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
