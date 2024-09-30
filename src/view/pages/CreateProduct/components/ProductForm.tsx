import React, { useEffect } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import type * as z from 'zod'
import { type Category, type Product } from '@prisma/client'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/view/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select'
import { Input } from '@/view/components/ui/input'
import { Textarea } from '@/view/components/ui/textarea'

import { Card } from '@/view/components/ui/card'
import { CreateCategoryPopover } from './CreateCategoryPopover'

import { useAuth } from '@/view/hooks/useAuth'
import { useCategories } from '@/view/hooks/queries/categories'

import { formatCEST, formatDecimal, formatNCM } from '@/view/utils/formatters'
import { parseStringNumber } from '@/view/utils/parsers'
import { type createProductSchema } from '../schema'

interface ProductFormProps {
  form: UseFormReturn<z.infer<typeof createProductSchema>>
  defaultValue?: Product & { category: Category | null }
}

export function ProductForm({ form, defaultValue }: ProductFormProps) {
  const { user } = useAuth()

  // TODO: paginate categories
  const { data, isLoading } = useCategories({ loggedUserId: user?.id ?? '', itemsPerPage: 99 }, { enabled: !!user?.id })
  const categories = data?.categories ?? []

  useEffect(() => {
    if (defaultValue) {
      form.setValue('name', defaultValue.name)
      form.setValue('brand', defaultValue.brand ?? '')
      form.setValue('description', defaultValue.description ?? '')
      form.setValue('barCode', defaultValue.barCode ?? '')
      form.setValue('costPrice', formatDecimal(String(defaultValue.costPrice)))
      form.setValue('price', formatDecimal(String(defaultValue.price)))
      form.setValue('availableQuantity', defaultValue.availableQuantity ?? 0)
      form.setValue('minimumQuantity', defaultValue.minimumQuantity ?? 0)
      form.setValue('icms', formatDecimal(String(defaultValue.icms)))
      form.setValue('ncm', formatNCM(defaultValue.ncm))
      form.setValue('cest', formatCEST(defaultValue.cest))
      form.setValue('cestSegment', defaultValue.cestSegment ?? '')
      form.setValue('cestDescription', defaultValue.cestDescription ?? '')
    }
  }, [defaultValue])

  useEffect(() => {
    if (!isLoading && defaultValue) {
      form.setValue('category', defaultValue.categoryId ?? '')
    }
  }, [isLoading, defaultValue])

  const [costPrice, price] = form.watch(['costPrice', 'price'])
  const profitMargin = (() => {
    if (costPrice.trim() === '' || costPrice.trim() === '0,00' || price.trim() === '' || price.trim() === '0,00')
      return 'N/A'

    const costPriceNumber = parseStringNumber(costPrice)
    const priceNumber = parseStringNumber(price)

    const profit = priceNumber - costPriceNumber
    const profitMargin = (profit / costPriceNumber) * 100

    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(profitMargin)
  })()

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Digite o nome do produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-1 items-end gap-2">
          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              // TODO: filter categories field
              <FormItem className="flex-1">
                <FormLabel>Categoria</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria do produto" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <CreateCategoryPopover />
        </div>

        <FormField
          control={form.control}
          name="brand"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Marca</FormLabel>
              <FormControl>
                <Input placeholder="Digite a marca do produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem className="flex-1">
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Adicione uma descrição para o produto (opcional)" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="barCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código de barras</FormLabel>
            <FormControl>
              <Input placeholder="Digite o código de barras do produto" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="flex gap-4">
        <FormField
          control={form.control}
          name="costPrice"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Preço de custo *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o preço de custo do produto"
                  {...field}
                  value={field.value.toString()}
                  onChange={(e) => {
                    const formatted = formatDecimal(e.target.value)
                    e.target.value = formatted
                    field.onChange(formatted)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Preço *</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o preço do produto"
                  {...field}
                  value={field.value.toString()}
                  onChange={(e) => {
                    const formatted = formatDecimal(e.target.value)
                    e.target.value = formatted
                    field.onChange(formatted)
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem className="flex-1">
          <FormLabel>Margem de lucro (%)</FormLabel>
          <FormControl>
            <Input value={profitMargin} readOnly disabled />
          </FormControl>
          <FormMessage />
        </FormItem>
      </div>

      <div className="flex gap-4">
        <FormField
          control={form.control}
          name="availableQuantity"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Quantidade disponível em estoque</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Digite a quantidade disponível do produto em estoque"
                  min={0}
                  {...field}
                  onChange={(e) => {
                    field.onChange(parseInt(e.target.value || '0'))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minimumQuantity"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>Quantidade mínima para estoque</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Digite a quantidade mínima do produto para estoque"
                  min={0}
                  {...field}
                  onChange={(e) => {
                    field.onChange(parseInt(e.target.value || '0'))
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <Card className="p-4 space-y-4">
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="icms"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>ICMS (%) *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter ICMS percentage"
                    {...field}
                    onChange={(e) => {
                      const formatted = formatDecimal(e.target.value)

                      e.target.value = formatted
                      field.onChange(formatted)
                    }}
                    maxLength={6}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ncm"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>NCM *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o NCM do produto"
                    {...field}
                    value={formatNCM((field.value ?? '').toString())}
                    onChange={(e) => {
                      const formatted = formatNCM(e.target.value)
                      e.target.value = formatted
                      field.onChange(formatted)
                    }}
                    maxLength={10}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cest"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>CEST *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o código CEST do produto"
                    {...field}
                    value={formatCEST((field.value ?? '').toString())}
                    onChange={(e) => {
                      const formatted = formatCEST(e.target.value)
                      e.target.value = formatted
                      field.onChange(formatted)
                    }}
                    maxLength={9}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="cestSegment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEST - Segmento</FormLabel>
              <FormControl>
                <Input placeholder="Digite o segmento do produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="cestDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CEST - Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Digite a descrição do segmento do produto" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </Card>
    </div>
  )
}
