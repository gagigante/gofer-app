import { useMutation } from '@tanstack/react-query'

import { queryClient } from '@/view/contexts/ReactQueryContext'

import { type CategoriesApi, type apiName } from '@/api/exposes/categories-api'
import {
  type CreateCategoryRequest,
  type CreateCategoryResponse,
  type DeleteCategoryRequest,
  type DeleteCategoryResponse,
} from '@/api/controllers/categories-controller'

export function useMutateOnCreateCategory() {
  return useMutation<CreateCategoryResponse['data'], Error, CreateCategoryRequest>({
    mutationFn: async ({ loggedUserId, name, description = '' }) => {
      const { data, err } = await (window as unknown as Record<typeof apiName, CategoriesApi>).categoriesApi.create({
        loggedUserId,
        name,
        description,
      })

      if (err) {
        throw err
      }

      return data
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] })

      return response
    },
  })
}

// export const useMutateOnUpdateCategory = () => {
//   const { apiClient } = useApi()

//   const service = productsService(apiClient.privateApi)

//   return useMutation(service.updateProduct, {
//     onSuccess: async (response) => {
//       await queryClient.invalidateQueries(['categories'])

//       return response
//     },
//   })
// }

export const useMutateOnDeleteCategory = () => {
  return useMutation<DeleteCategoryResponse['data'], Error, DeleteCategoryRequest>({
    mutationFn: async ({ loggedUserId, categoryId }) => {
      const { data, err } = await (window as unknown as Record<typeof apiName, CategoriesApi>).categoriesApi.delete({
        loggedUserId,
        categoryId,
      })

      if (err) {
        throw err
      }

      return data
    },
    onSuccess: async (response) => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] })

      return response
    },
  })
}
