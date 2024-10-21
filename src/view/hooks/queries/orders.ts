import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { type apiName, type OrdersApi } from '@/api/exposes/orders-api'
import { type GetOrderRequest, type GetOrderResponse, type ListOrdersRequest, type ListOrdersResponse } from '@/api/controllers/orders-controller'

import { ITEMS_PER_PAGE } from '@/view/constants/ITEMS_PER_PAGE'

export function useOrders(
  { loggedUserId, page = 1, itemsPerPage = ITEMS_PER_PAGE }: ListOrdersRequest,
  options?: Omit<UseQueryOptions<ListOrdersResponse['data']>, 'queryKey'>,
) {
  const key = ['orders', JSON.stringify({ page, itemsPerPage })]

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, err } = await (window as unknown as Record<typeof apiName, OrdersApi>).ordersApi.list({
        loggedUserId,
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

export function useOrder(
  { loggedUserId, orderId }: GetOrderRequest,
  options?: Omit<UseQueryOptions<GetOrderResponse['data']>, 'queryKey'>,
) {
  const key = ['orders', orderId]

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, err } = await (window as unknown as Record<typeof apiName, OrdersApi>).ordersApi.get({
        loggedUserId,
        orderId,
      })

      if (err) {
        throw err
      }

      return data
    },
    ...options,
  })
}
