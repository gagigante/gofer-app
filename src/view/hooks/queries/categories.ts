import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { type apiName, type CategoriesApi } from '@/api/exposes/categories-api'
import { ITEMS_PER_PAGE } from '@/view/constants/ITEMS_PER_PAGE'
import { type ListCategoriesResponse } from '@/api/controllers/categories-controller'

interface Params {
  userId: string
  name?: string
  page?: number
  itemsPerPage?: number
}

export function useCategories(
  { userId, name = '', page = 1, itemsPerPage = ITEMS_PER_PAGE }: Params,
  options?: Omit<UseQueryOptions<ListCategoriesResponse>, 'queryKey'>,
) {
  const key = ['categories', JSON.stringify({ name, page, itemsPerPage })]

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const response = await (window as unknown as Record<typeof apiName, CategoriesApi>).categoriesApi.list({
        loggedUserId: userId,
        name,
        page,
        itemsPerPage,
      })

      return response
    },
    ...options,
  })
}
