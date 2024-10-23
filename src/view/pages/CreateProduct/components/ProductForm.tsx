import { useEffect, useState } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import type * as z from 'zod'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/view/components/ui/form'
import { Combobox } from '@/view/components/Combobox'
import { Input } from '@/view/components/ui/input'
import { Textarea } from '@/view/components/ui/textarea'

import { Card } from '@/view/components/ui/card'
import { CreateCategoryPopover } from './CreateCategoryPopover'
import { CreateBrandPopover } from './CreateBrandPopover'

import { useAuth } from '@/view/hooks/useAuth'
import { useCategories } from '@/view/hooks/queries/categories'
import { useBrands } from '@/view/hooks/queries/brands'

import { formatCEST, formatDecimal, formatNCM } from '@/view/utils/formatters'
import { parseStringNumber } from '@/view/utils/parsers'

import { type createProductSchema } from '../schema'
import { type Category, type Product } from '@/api/db/schema'

interface ProductFormProps {
  form: UseFormReturn<z.infer<typeof createProductSchema>>
  defaultValue?: Product & { category: Category | null }
}

export function ProductForm({ form, defaultValue }: ProductFormProps) {
  const { user } = useAuth()

  const [categoriesFilter, setCategoriesFilter] = useState('')
  const [brandsFilter, setBrandsFilter] = useState('')
  
  const { data: categoriesResponse, isLoading: isLoadingCategories } = useCategories({ 
    loggedUserId: user?.id ?? '',
    name: categoriesFilter,
  }, { 
    enabled: !!user?.id
  })
  const categories = (categoriesResponse?.categories ?? []).map(item => ({ label: item.name!, value: item.id }))

  const { data: brandsResponse, isLoading: isLoadingBrands } = useBrands({ 
    loggedUserId: user?.id ?? '',
    name: brandsFilter,
  }, {
    enabled: !!user?.id
  })
  const brands = (brandsResponse?.brands ?? []).map(item => ({ label: item.name!, value: item.id }))

  useEffect(() => {
    if (defaultValue) {
      form.setValue('name', defaultValue.name ?? '')
      form.setValue('description', defaultValue.description ?? '')
      form.setValue('barCode', defaultValue.barCode ?? '')
      form.setValue('costPrice', formatDecimal(String(defaultValue.costPrice)))
      form.setValue('price', formatDecimal(String(defaultValue.price)))
      form.setValue('availableQuantity', defaultValue.availableQuantity ?? 0)
      form.setValue('minimumQuantity', defaultValue.minimumQuantity ?? 0)
      form.setValue('icms', formatDecimal(String(defaultValue.icms)))
      form.setValue('ncm', formatNCM(defaultValue.ncm ?? ''))
      form.setValue('cest', formatCEST(defaultValue.cest ?? ''))
      form.setValue('cestSegment', defaultValue.cestSegment ?? '')
      form.setValue('cestDescription', defaultValue.cestDescription ?? '')
    }
  }, [defaultValue])

  useEffect(() => {
    if (defaultValue) {
      if (!isLoadingCategories) {
        form.setValue('category', defaultValue.categoryId ?? '')  
      }

      if (!isLoadingBrands) {
        form.setValue('brand', defaultValue.brandId ?? '')  
      }
    }
  }, [isLoadingCategories, isLoadingBrands, defaultValue])

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
              <div className="flex flex-1 flex-col gap-3">
                <FormLabel>Categoria</FormLabel>
                <Combobox
                  placeholder="Selecione uma categoria"
                  searchPlaceholder="Busque pelo nome da categoria"
                  emptyPlaceholder="Nenhuma categoria encontrada."
                  options={categories}
                  onChangeFilter={setCategoriesFilter}
                  value={categories.find(item => item.value === field.value)}
                  onSelectOption={({ value }) => field.onChange(value)}
                />
              </div>
            )}
          />

          <CreateCategoryPopover />
        </div>

        <div className="flex flex-1 items-end gap-2">
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <div className="flex flex-1 flex-col gap-3">
                <FormLabel>Marca</FormLabel>
                <Combobox
                  placeholder="Selecione uma marca"
                  searchPlaceholder="Busque pelo nome da marca"
                  emptyPlaceholder="Nenhuma marca encontrada."
                  options={brands}
                  onChangeFilter={setBrandsFilter}
                  value={brands.find(item => item.value === field.value)}
                  onSelectOption={({ value }) => field.onChange(value)}
                />
              </div>
            )}
          />
          
          <CreateBrandPopover />
        </div>
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
              <FormLabel>Preço de custo (R$) *</FormLabel>
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
              <FormLabel>Preço (R$) *</FormLabel>
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
