import { useMutation } from '@tanstack/react-query'

import { queryClient } from '@/view/contexts/ReactQueryContext'

import { type CustomersApi, type apiName } from '@/api/exposes/customers-api'
import {
  type CreateCustomerRequest,
  type CreateCustomerResponse,
  type UpdateCustomerRequest,
  type UpdateCustomerResponse,
  type DeleteCustomerRequest,
  type DeleteCustomerResponse,
} from '@/api/controllers/customers-controller'

export function useMutateOnCreateCustomer() {
  return useMutation<CreateCustomerResponse['data'], Error, CreateCustomerRequest>({
    mutationFn: async ({ loggedUserId, ...newCustomer }) => {
      const { data, err } = await (window as unknown as Record<typeof apiName, CustomersApi>).customersApi.create({
        loggedUserId,
        ...newCustomer,
      })

      if (err) {
        throw err
      }

      return data
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['customers'] })

      return response
    },
  })
}

export function useMutateOnUpdateCustomer() {
  return useMutation<UpdateCustomerResponse['data'], Error, UpdateCustomerRequest>({
    mutationFn: async ({ loggedUserId, id, ...updatedCustomer }) => {
      const { data, err } = await (window as unknown as Record<typeof apiName, CustomersApi>).customersApi.update({
        loggedUserId,
        id,
        ...updatedCustomer,
      })

      if (err) {
        throw err
      }

      return data
    },
    onSuccess: async (response) => {
      await Promise.all([queryClient.invalidateQueries({ queryKey: ['customers'] })])

      return response
    },
  })
}

export function useMutateOnDeleteCustomer() {
  return useMutation<DeleteCustomerResponse['data'], Error, DeleteCustomerRequest>({
    mutationFn: async ({ loggedUserId, customerId }) => {
      const { data, err } = await (window as unknown as Record<typeof apiName, CustomersApi>).customersApi.delete({
        loggedUserId,
        customerId,
      })

      if (err) {
        throw err
      }

      return data
    },
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['customers'] }),
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
      ])

      return response
    },
  })
}
