import { useQuery, type UseQueryOptions } from '@tanstack/react-query'

import {
  type GetByBarcodeRequest,
  type GetByBarcodeResponse,
  type ListProductsRequest,
  type ListProductsResponse,
} from '@/api/controllers/products-controller'
import { type apiName, type ProductsApi } from '@/api/exposes/products-api'

import { ITEMS_PER_PAGE } from '@/view/constants/ITEMS_PER_PAGE'

export function useProducts(
  { loggedUserId, filterOptions = {}, page = 1, itemsPerPage = ITEMS_PER_PAGE, orderBy }: ListProductsRequest,
  options?: Omit<UseQueryOptions<ListProductsResponse['data']>, 'queryKey'>,
) {
  const key = ['products', JSON.stringify({ filterOptions, page, itemsPerPage, orderBy })]

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, err } = await (window as unknown as Record<typeof apiName, ProductsApi>).productsApi.list({
        loggedUserId,
        filterOptions,
        page,
        itemsPerPage,
        orderBy,
      })

      if (err) {
        throw err
      }

      return data
    },
    ...options,
  })
}

export function useProductByBarcode(
  { loggedUserId, barcode }: GetByBarcodeRequest,
  options?: Omit<UseQueryOptions<GetByBarcodeResponse['data']>, 'queryKey'>,
) {
  const key = ['products', barcode]

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, err } = await (window as unknown as Record<typeof apiName, ProductsApi>).productsApi.getByBarcode({
        loggedUserId,
        barcode,
      })

      if (err) {
        throw err
      }

      return data
    },
    ...options,
  })
}
