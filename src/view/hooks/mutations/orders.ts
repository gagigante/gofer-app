import { useMutation } from '@tanstack/react-query'

import { queryClient } from '@/view/contexts/ReactQueryContext'

import type {
  DeleteOrderRequest,
  DeleteOrderResponse,
  CreateOrderRequest,
  CreateOrderResponse,
  UpdateOrderStatusRequest,
  ListOrdersResponse,
  GetOrderResponse,
} from '@/api/controllers/orders-controller'
import { type OrdersApi, apiName } from '@/api/exposes/orders-api'
import { type OrderWithCustomer } from '@/api/repositories/orders-repository'

export function useMutateOnCreateOrder() {
  return useMutation<CreateOrderResponse['data'], Error, CreateOrderRequest>({
    mutationFn: async (data) => {
      const { data: response, err } = await (window as unknown as Record<typeof apiName, OrdersApi>).ordersApi.create(
        data,
      )

      if (err) {
        throw err
      }

      return response
    },
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
        queryClient.invalidateQueries({ queryKey: ['reports', 'orders'] }),
      ])

      return response
    },
  })
}

export function useMutateOnUpdateOrderStatus() {
  return useMutation({
    mutationFn: async ({ loggedUserId, orderId, status }: UpdateOrderStatusRequest) => {
      const { data, err } = await (window as unknown as Record<typeof apiName, OrdersApi>).ordersApi.updateStatus({
        loggedUserId,
        orderId,
        status,
      })

      if (err) {
        throw err
      }

      return data
    },
    onMutate: async (variables) => {
      // Cancel any outgoing re-fetches to avoid overwriting our optimistic update
      await queryClient.cancelQueries({ queryKey: ['orders'] })
      await queryClient.cancelQueries({ queryKey: ['orders', variables.orderId] })

      const previousOrdersData = queryClient.getQueryData(['orders'])
      const previousOrderData = queryClient.getQueryData(['orders', variables.orderId])

      queryClient.setQueriesData({ queryKey: ['orders'] }, (oldData: ListOrdersResponse['data'] | undefined) => {
        if (!oldData?.orders) return oldData

        const updatedOrders = oldData.orders.map((order: OrderWithCustomer) => {
          if (order.id === variables.orderId) {
            return { ...order, status: variables.status }
          }
          return order
        })

        return { ...oldData, orders: updatedOrders }
      })

      queryClient.setQueriesData(
        { queryKey: ['orders', variables.orderId] },
        (oldData: GetOrderResponse['data'] | undefined) => {
          if (!oldData) return oldData

          return {
            ...oldData,
            status: variables.status,
          }
        },
      )

      return { previousOrdersData, previousOrderData }
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders', variables.orderId] })
    },
    // If the mutation fails, use the context returned from onMutate to roll back
    onError: (_err, variables, context) => {
      if (context?.previousOrdersData) {
        queryClient.setQueryData(['orders'], context.previousOrdersData)
      }
      if (context?.previousOrderData) {
        queryClient.setQueryData(['orders', variables.orderId], context.previousOrderData)
      }
    },
  })
}

export function useMutateOnDeleteOrder() {
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
