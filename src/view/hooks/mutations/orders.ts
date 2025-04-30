import { useMutation } from '@tanstack/react-query'

import { queryClient } from '@/view/contexts/ReactQueryContext'

import {
  type DeleteOrderRequest,
  type DeleteOrderResponse,
  type CreateOrderRequest,
  type CreateOrderResponse,
} from '@/api/controllers/orders-controller'
import { type OrdersApi, apiName } from '@/api/exposes/orders-api'

export function useMutateOnCreateOrder() {
  return useMutation<CreateOrderResponse['data'], Error, CreateOrderRequest>({
    mutationFn: async ({ loggedUserId, products, customerId, obs }) => {
      const { data, err } = await (window as unknown as Record<typeof apiName, OrdersApi>).ordersApi.create({
        loggedUserId,
        products,
        customerId,
        obs,
      })

      if (err) {
        throw err
      }

      return data
    },
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ])

      return response
    },
  })
}

export function useMutateOnDeleteBrand() {
  return useMutation<DeleteOrderResponse['data'], Error, DeleteOrderRequest>({
    mutationFn: async ({ loggedUserId, orderId }) => {
      const { data, err } = await (window as unknown as Record<typeof apiName, OrdersApi>).ordersApi.delete({
        loggedUserId,
        orderId,
      })

      if (err) {
        throw err
      }

      return data
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })

      return response
    },
  })
}
