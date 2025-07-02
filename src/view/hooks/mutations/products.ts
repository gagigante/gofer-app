import { useMutation } from '@tanstack/react-query'

import { queryClient } from '@/view/contexts/ReactQueryContext'

import {
  type UpdateProductRequest,
  type UpdateProductResponse,
  type CreateProductRequest,
  type CreateProductResponse,
} from '@/api/controllers/products-controller'
import { type apiName, type ProductsApi } from '@/api/exposes/products-api'

export function useMutateOnCreateProduct() {
  return useMutation<CreateProductResponse['data'], Error, CreateProductRequest>({
    mutationFn: async (data) => {
      const { data: response, err } = await (
        window as unknown as Record<typeof apiName, ProductsApi>
      ).productsApi.create(data)

      if (err) {
        throw err
      }

      return response
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['products'] })

      return response
    },
  })
}

export function useMutateOnUpdateProduct() {
  return useMutation<UpdateProductResponse['data'], Error, UpdateProductRequest>({
    mutationFn: async (data) => {
      const { data: response, err } = await (
        window as unknown as Record<typeof apiName, ProductsApi>
      ).productsApi.update(data)

      if (err) {
        throw err
      }

      return response
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['categories'] })
      queryClient.invalidateQueries({ queryKey: ['brands'] })

      return response
    },
  })
}
