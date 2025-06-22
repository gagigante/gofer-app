import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Eye, EyeOff, RefreshCcw } from 'lucide-react'

import { Button } from '@/view/components/ui/button'
import { PeriodTabs } from './components/PeriodTabs'
import { BigNumbers } from './components/BigNumbers'
import { OrdersProfitPerDayChart } from './components/OrdersProfitPerDayChart'
import { OrdersProfitPerDayChartSkeleton } from './components/OrdersProfitPerDayChartSkeleton'

import { useAuth } from '@/view/hooks/useAuth'
import { useOrdersReport } from '@/view/hooks/queries/reports'

import { type PeriodValue } from '@/api/controllers/reports-controller'

export function Reports() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [isFinancialInfoVisible, setIsFinancialInfoVisible] = useState(false)
  const [period, setPeriod] = useState<PeriodValue>('current_month')

  const { data, isFetching } = useOrdersReport({ loggedUserId: user?.id ?? '', period })

  const chartData =
    data?.orders
      .map((order) => ({
        date: order.date,
        total: order.totalPrice,
        cost: order.totalCostPrice,
      }))
      .reverse() ?? []

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-3 py-6 overflow-auto">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight">Relatórios</h2>

        <div className="flex items-start justify-between">
          <PeriodTabs value={period} onValueChange={setPeriod} />

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="icon" onClick={() => setIsFinancialInfoVisible(!isFinancialInfoVisible)}>
              {isFinancialInfoVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>

            <Button
              variant="secondary"
              size="icon"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['reports', 'orders'] })}
              disabled={isFetching}
            >
              <RefreshCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="w-full grid grid-cols-5 gap-4 mb-4">
          <BigNumbers
            ordersCount={data?.ordersCount ?? 0}
            revenue={data?.revenue ?? 0}
            profit={data?.profit ?? 0}
            margin={data?.margin ?? 0}
            averageRevenuePerOrder={data?.averageRevenuePerOrder ?? 0}
            isLoading={isFetching}
            isVisible={isFinancialInfoVisible}
          />
        </div>

        {isFetching ? (
          <OrdersProfitPerDayChartSkeleton />
        ) : (
          <OrdersProfitPerDayChart data={chartData} isVisible={isFinancialInfoVisible} />
        )}
      </div>
    </div>
  )
}
