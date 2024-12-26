import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { type CustomersApi, type apiName } from '@/api/exposes/customers-api'
import {
  type GetCustomerRequest,
  type GetCustomerResponse,
  type ListCustomersRequest,
  type ListCustomersResponse,
} from '@/api/controllers/customers-controller'

import { ITEMS_PER_PAGE } from '@/view/constants/ITEMS_PER_PAGE'

export function useCustomers(
  { loggedUserId, name = '', page = 1, itemsPerPage = ITEMS_PER_PAGE }: ListCustomersRequest,
  options?: Omit<UseQueryOptions<ListCustomersResponse['data']>, 'queryKey'>,
) {
  const key = ['customers', JSON.stringify({ name, page, itemsPerPage })]

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, err } = await (window as unknown as Record<typeof apiName, CustomersApi>).customersApi.list({
        loggedUserId,
        name,
        page,
        itemsPerPage,
      })

      if (err) {
        throw err
      }

      return data
    },
    ...options,
  })
}

export function useCustomer(
  { loggedUserId, customerId }: GetCustomerRequest,
  options?: Omit<UseQueryOptions<GetCustomerResponse['data']>, 'queryKey'>,
) {
  const key = ['customers', customerId]

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, err } = await (window as unknown as Record<typeof apiName, CustomersApi>).customersApi.get({
        loggedUserId,
        customerId,
      })

      if (err) {
        throw err
      }

      return data
    },
    ...options,
  })
}
