import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { type apiName, type CategoriesApi } from '@/api/exposes/categories-api'
import { type ListCategoriesRequest, type ListCategoriesResponse } from '@/api/controllers/categories-controller'

import { ITEMS_PER_PAGE } from '@/view/constants/ITEMS_PER_PAGE'

export function useCategories(
  { loggedUserId, name = '', page = 1, itemsPerPage = ITEMS_PER_PAGE }: ListCategoriesRequest,
  options?: Omit<UseQueryOptions<ListCategoriesResponse['data']>, 'queryKey'>,
) {
  const key = ['categories', JSON.stringify({ name, page, itemsPerPage })]

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, err } = await (window as unknown as Record<typeof apiName, CategoriesApi>).categoriesApi.list({
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
