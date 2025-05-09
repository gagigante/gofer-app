import { useState } from 'react'
import { Controller, useFormContext } from 'react-hook-form'
import * as z from 'zod'

import { Label } from '@/view/components/ui/label'
import { Combobox } from '@/view/components/Combobox'
import { CreateCustomerPopover } from './CreateCustomerPopover'

import { useAuth } from '@/view/hooks/useAuth'
import { useCustomers } from '@/view/hooks/queries/customers'

import { createOrderSchema } from '../schema'

export function CustomerFormSection() {
  const { user } = useAuth()
  const { control, setValue } = useFormContext<z.infer<typeof createOrderSchema>>()

  const [customersFilter, setCustomersFilter] = useState('')

  const { data: customersResponse } = useCustomers(
    {
      loggedUserId: user?.id ?? '',
      name: customersFilter,
      page: 1,
    },
    {
      enabled: !!user,
      placeholderData: (previousData) => previousData,
    },
  )
  const customers = (customersResponse?.customers ?? []).map((item) => ({ label: item.name!, value: item.id }))

  return (
    <div className="flex my-4">
      <div className="flex flex-1 items-end gap-2">
        <div className="flex flex-1 flex-col gap-3">
          <Controller
            name="customer"
            control={control}
            render={({ field }) => (
              <>
                <Label>Cliente</Label>
                <Combobox
                  placeholder="Selecione um cliente"
                  searchPlaceholder="Busque pelo nome do cliente"
                  emptyPlaceholder="Nenhum cliente encontrado."
                  options={customers}
                  onChangeFilter={setCustomersFilter}
                  value={field.value ? { label: field.value.name, value: field.value.id } : undefined}
                  onSelectOption={(option) => field.onChange({ id: option.value, name: option.label })}
                />
              </>
            )}
          />
        </div>

        <CreateCustomerPopover
          onCreateCustomer={(id, name) => {
            setValue('customer', { id, name })
          }}
        />
      </div>
    </div>
  )
}
