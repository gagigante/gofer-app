import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import type * as z from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Form } from '@/view/components/ui/form'
import { Button } from '@/view/components/ui/button'
import { ProductForm } from '../CreateProduct/components/ProductForm'

import { useAuth } from '@/view/hooks/useAuth'
import { useToast } from '@/view/components/ui/use-toast'
import { useMutateOnUpdateProduct } from '@/view/hooks/mutations/products'

import { createProductSchema } from '../CreateProduct/schema'
import { parseStringNumber } from '@/view/utils/parsers'

import { type Category, type Product } from '@/api/db/schema'

export function UpdateProduct() {
  const {
    state: { selectedProduct },
  } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { toast } = useToast()

  const { mutateAsync } = useMutateOnUpdateProduct()

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
        categoryId: values.category || undefined,
        barCode: values.barCode,
        cest: values.cest.replaceAll('.', ''),
        ncm: values.ncm.replaceAll('.', ''),
        icms: parseStringNumber(values.icms) * 100,
        costPrice: parseStringNumber(values.costPrice) * 100,
        price: parseStringNumber(values.price) * 100,
      }
    })()

    await mutateAsync(
      { loggedUserId: user.id, productId: product.id, ...formattedValues },
      {
        onSuccess: () => {
          toast({
            title: 'Produto atualizado com sucesso.',
            duration: 3000,
          })

          navigate('..', { relative: 'path' })
        },
        onError: (err) => {
          if (err.message === 'ProductAlreadyExistsError') {
            toast({
              title: 'Ja existe um produto com este nome.',
              duration: 3000,
            })
            return
          }

          if (err.message === 'ProductWithThisBarCodeALreadyExistsError') {
            toast({
              title: 'Ja existe um produto com este código de barras.',
              duration: 3000,
            })
            return
          }

          toast({
            title: 'Houve um erro ao atualizar este produto. Tente novamente.',
            duration: 3000,
          })
        },
      },
    )
  }

  const product = selectedProduct as Product & { category: Category | null }

  return (
    <Form {...form}>
      <form className="h-full flex flex-col" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex-1 px-3 py-6 overflow-auto">
          <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Atualizar produto</h2>

          <ProductForm form={form} defaultValue={product} />
        </div>

        <footer className="flex px-3 py-4 border-t border-border">
          <div className="flex gap-2 ml-auto">
            <Button type="submit">Atualizar produto</Button>

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
