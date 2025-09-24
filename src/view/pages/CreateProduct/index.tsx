import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import type * as z from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Form } from '@/view/components/ui/form'

import { Button } from '@/view/components/ui/button'

import { useAuth } from '@/view/hooks/useAuth'
import { useMutateOnCreateProduct } from '@/view/hooks/mutations/products'

import { parseStringNumber } from '@/view/utils/parsers'
import { createProductSchema } from './schema'
import { ProductForm } from './components/ProductForm'

export function CreateProduct() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const { mutateAsync, status } = useMutateOnCreateProduct()

  const form = useForm<z.infer<typeof createProductSchema>>({
    resolver: zodResolver(createProductSchema),
    defaultValues: {
      name: '',
      category: '',
      brand: '',
      description: '',
      barCode: '',
      price: '0,00',
      costPrice: '0,00',
      profitMargin: '0,00',
      availableQuantity: 0,
      minimumQuantity: 0,
      icms: '0,00',
      ncm: '',
      cest: '',
      cestSegment: '',
      cestDescription: '',
    },
  })

  async function onSubmit(values: z.infer<typeof createProductSchema>) {
    if (!user) return

    const formattedValues = (() => {
      return {
        ...values,
        categoryId: values.category,
        brandId: values.brand,
        barCode: values.barCode,
        cest: values.cest.replaceAll('.', ''),
        ncm: values.ncm.replaceAll('.', ''),
        icms: parseStringNumber(values.icms) * 100,
        costPrice: parseStringNumber(values.costPrice) * 100,
        price: parseStringNumber(values.price) * 100,
      }
    })()

    await mutateAsync(
      { loggedUserId: user.id, ...formattedValues },
      {
        onSuccess: () => {
          toast('Produto criado com sucesso.')

          navigate('..', { relative: 'path' })
        },
        onError: (err) => {
          if (err.message === 'ProductAlreadyExistsError') {
            toast('Ja existe um produto com este nome.')
            return
          }

          if (err.message === 'ProductWithThisBarCodeALreadyExistsError') {
            toast('Ja existe um produto com este código de barras.')
            return
          }

          toast('Houve um erro ao criar o produto. Tente novamente.')
        },
      },
    )
  }

  return (
    <Form {...form}>
      <form className="h-full flex flex-col" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex-1 px-3 py-6 overflow-auto">
          <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Criar produto</h2>

          <ProductForm form={form} />
        </div>

        <footer className="flex px-3 py-4 border-t border-border">
          <div className="flex gap-2 ml-auto">
            <Button type="submit" disabled={status === 'pending'}>
              {status === 'pending' && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
              Adicionar produto
            </Button>

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
