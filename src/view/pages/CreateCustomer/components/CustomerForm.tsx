import { useEffect } from 'react'
import { type UseFormReturn } from 'react-hook-form'
import type * as z from 'zod'

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/view/components/ui/form'
import { Card } from '@/view/components/ui/card'
import { Input } from '@/view/components/ui/input'

import { type createCustomerSchema } from '../schema'
import { type Customer } from '@/api/db/schema'
import { formatCNPJ, formatCPF, formatPhone, formatRG } from '@/view/utils/formatters'

interface CustomerFormProps {
  form: UseFormReturn<z.infer<typeof createCustomerSchema>>
  defaultValue?: Customer
}

export function CustomerForm({ form, defaultValue }: CustomerFormProps) {
  useEffect(() => {
    if (defaultValue) {
      form.setValue('name', defaultValue.name ?? '')
      form.setValue('rg', formatRG(defaultValue.rg ?? ''))
      form.setValue('cpf', formatCPF(defaultValue.cpf ?? ''))
      form.setValue('cnpj', formatCNPJ(defaultValue.cnpj ?? ''))
      form.setValue('ie', defaultValue.ie ?? '')
      form.setValue('email', defaultValue.email ?? '')
      form.setValue('phone', formatPhone(defaultValue.phone ?? ''))
      form.setValue('zipcode', defaultValue.zipcode ?? '')
      form.setValue('city', defaultValue.city ?? '')
      form.setValue('street', defaultValue.street ?? '')
      form.setValue('neighborhood', defaultValue.neighborhood ?? '')
      form.setValue('complement', defaultValue.complement ?? '')
    }
  }, [defaultValue])

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
                <Input placeholder="Digite o nome do cliente" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field: { value, onChange, ...rest } }) => (
            <FormItem className="flex-1">
              <FormLabel>Telefone</FormLabel>
              <FormControl>
                <Input
                  placeholder="Digite o telefone do cliente"
                  value={formatPhone(value ?? '')}
                  onChange={(e) => {
                    const formatted = formatPhone(e.target.value)
                    e.target.value = formatted
                    onChange(formatted)
                  }}
                  {...rest}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormLabel>E-mail</FormLabel>
              <FormControl>
                <Input placeholder="Digite o e-mail do cliente" {...field} />
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
            name="rg"
            render={({ field: { value, onChange, ...rest } }) => (
              <FormItem className="flex-1">
                <FormLabel>RG</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o RG do cliente"
                    value={formatRG(value ?? '')}
                    onChange={(e) => {
                      const formatted = formatRG(e.target.value)
                      e.target.value = formatted
                      onChange(formatted)
                    }}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="cpf"
            render={({ field: { value, onChange, ...rest } }) => (
              <FormItem className="flex-1">
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o CPF do cliente"
                    value={formatCPF(value ?? '')}
                    onChange={(e) => {
                      const formatted = formatCPF(e.target.value)
                      e.target.value = formatted
                      onChange(formatted)
                    }}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="cnpj"
            render={({ field: { value, onChange, ...rest } }) => (
              <FormItem className="flex-1">
                <FormLabel>CNPJ</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Digite o CNPJ do cliente"
                    value={formatCNPJ(value ?? '')}
                    onChange={(e) => {
                      const formatted = formatCNPJ(e.target.value)
                      e.target.value = formatted
                      onChange(formatted)
                    }}
                    {...rest}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ie"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Inscrição Estadual (IE)</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o IE do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Card>

      <Card className="p-4 space-y-4">
        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="zipcode"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>CEP</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o CEP do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Cidade</FormLabel>
                <FormControl>
                  <Input placeholder="Digite a cidade do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="street"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Logradouro</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o logradouro do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="neighborhood"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Bairro</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o bairro do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="complement"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Complemento</FormLabel>
                <FormControl>
                  <Input placeholder="Digite o complemento do cliente" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Card>
    </div>
  )
}
