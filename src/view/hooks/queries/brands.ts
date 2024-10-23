import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import { type apiName, type BrandsApi } from '@/api/exposes/brands-api'
import { 
  type GetBrandRequest,
  type GetBrandResponse,
  type ListBrandsRequest,
  type ListBrandsResponse,
} from '@/api/controllers/brands-controller'

import { ITEMS_PER_PAGE } from '@/view/constants/ITEMS_PER_PAGE'

export function useBrands(
  { loggedUserId, name = '', page = 1, itemsPerPage = ITEMS_PER_PAGE }: ListBrandsRequest,
  options?: Omit<UseQueryOptions<ListBrandsResponse['data']>, 'queryKey'>,
) {
  const key = ['brands', JSON.stringify({ name, page, itemsPerPage })]

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, err } = await (window as unknown as Record<typeof apiName, BrandsApi>).brandsApi.list({
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

export function useBrand(
  { loggedUserId, brandId }: GetBrandRequest,
  options?: Omit<UseQueryOptions<GetBrandResponse['data']>, 'queryKey'>,
) {
  const key = ['brands', brandId]

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, err } = await (window as unknown as Record<typeof apiName, BrandsApi>).brandsApi.get({
        loggedUserId,
        brandId,
      })

      if (err) {
        throw err
      }

      return data
    },
    ...options,
  })
}
