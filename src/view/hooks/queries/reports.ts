import { useQuery, UseQueryOptions } from '@tanstack/react-query'

import { apiName, type ReportsApi } from '@/api/exposes/reports-api'
import type { GetOrdersReportRequest, GetOrdersReportResponse } from '@/api/controllers/reports-controller'

export function useOrdersReport(
  { loggedUserId, period }: GetOrdersReportRequest,
  options?: Omit<UseQueryOptions<GetOrdersReportResponse['data']>, 'queryKey'>,
) {
  const key = ['reports', 'orders', period]

  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const { data, err } = await (window as unknown as Record<typeof apiName, ReportsApi>).reportsApi.getOrdersReport({
        loggedUserId,
        period,
      })

      if (err) {
        throw err
      }

      return data
    },
    ...options,
  })
}
