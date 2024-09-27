import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { type ListProductsRequest, type ListProductsResponse } from '@/api/controllers/products-controller'
import { type apiName, type ProductsApi } from '@/api/exposes/products-api'

import { ITEMS_PER_PAGE } from '@/view/constants/ITEMS_PER_PAGE'

export function useCategories(
  { loggedUserId, name = '', page = 1, itemsPerPage = ITEMS_PER_PAGE }: ListProductsRequest,
  options?: Omit<UseQueryOptions<ListProductsResponse['data']>, 'queryKey'>,
) {
  const key = ['products', JSON.stringify({ name, page, itemsPerPage })]

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, err } = await (window as unknown as Record<typeof apiName, ProductsApi>).productsApi.list({
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
