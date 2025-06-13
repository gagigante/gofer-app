import { useMutation } from '@tanstack/react-query'

import { queryClient } from '@/view/contexts/ReactQueryContext'

import { type BrandsApi, type apiName } from '@/api/exposes/brands-api'
import {
  type CreateBrandRequest,
  type CreateBrandResponse,
  type UpdateBrandRequest,
  type UpdateBrandResponse,
  type DeleteBrandRequest,
  type DeleteBrandResponse,
} from '@/api/controllers/brands-controller'

export function useMutateOnCreateBrand() {
  return useMutation<CreateBrandResponse['data'], Error, CreateBrandRequest>({
    mutationFn: async ({ loggedUserId, name }) => {
      const { data, err } = await (window as unknown as Record<typeof apiName, BrandsApi>).brandsApi.create({
        loggedUserId,
        name,
      })

      if (err) {
        throw err
      }

      return data
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['brands'] })

      return response
    },
  })
}

export function useMutateOnUpdateBrand() {
  return useMutation<UpdateBrandResponse['data'], Error, UpdateBrandRequest>({
    mutationFn: async ({ loggedUserId, brandId, updatedName }) => {
      const { data, err } = await (window as unknown as Record<typeof apiName, BrandsApi>).brandsApi.update({
        loggedUserId,
        brandId,
        updatedName,
      })

      if (err) {
        throw err
      }

      return data
    },
    onSuccess: async (response) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['brands'] }),
        queryClient.invalidateQueries({ queryKey: ['products'] }),
      ])

      return response
    },
  })
}

export function useMutateOnDeleteBrand() {
  return useMutation<DeleteBrandResponse['data'], Error, DeleteBrandRequest>({
    mutationFn: async ({ loggedUserId, brandId }) => {
      const { data, err } = await (window as unknown as Record<typeof apiName, BrandsApi>).brandsApi.delete({
        loggedUserId,
        brandId,
      })

      if (err) {
        throw err
      }

      return data
    },
    onSuccess: async (response) => {
      queryClient.invalidateQueries({ queryKey: ['brands'] })
      queryClient.invalidateQueries({ queryKey: ['products'] })

      return response
    },
  })
}
