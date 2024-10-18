import { useMutation } from '@tanstack/react-query'

import { queryClient } from '@/view/contexts/ReactQueryContext'

import {type  CreateOrderRequest, type CreateOrderResponse } from '@/api/controllers/orders-controller'
import { type OrdersApi, apiName } from '@/api/exposes/orders-api'

export function useMutateOnCreateOrder() {
  return useMutation<CreateOrderResponse['data'], Error, CreateOrderRequest>({
    mutationFn: async ({ loggedUserId, products }) => {
      const { data, err } = await (window as unknown as Record<typeof apiName, OrdersApi>).ordersApi.create({
        loggedUserId,
        products,
      })

      if (err) {
        throw err
      }

      return data
    },
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),       
      ])

      return response
    },
  })
}
