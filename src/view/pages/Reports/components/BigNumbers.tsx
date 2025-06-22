import { Card, CardDescription, CardHeader, CardTitle } from '@/view/components/ui/card'
import { Skeleton } from '@/view/components/ui/skeleton'

import { formatCurrency, maskFinancialValue } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

interface BigNumbersProps {
  ordersCount: number
  revenue: number
  profit: number
  margin: number
  averageRevenuePerOrder: number
  isLoading: boolean
  isVisible: boolean
}

interface NumberCardProps {
  title: string
  value: string
  isLoading: boolean
  isVisible: boolean
}

function NumberCard({ title, value, isLoading, isVisible }: NumberCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader className="relative @[220px]/card:p-6 p-3">
        <CardDescription className="@[220px]/card:text-sm text-xs">{title}</CardDescription>
        {isLoading ? (
          <Skeleton className="@[220px]/card:h-8 h-7 w-full" />
        ) : (
          <CardTitle className="@[220px]/card:text-2xl text-lg font-semibold tabular-nums">
            {isVisible ? value : maskFinancialValue(value)}
          </CardTitle>
        )}
      </CardHeader>
    </Card>
  )
}

export function BigNumbers({
  ordersCount,
  revenue,
  profit,
  margin,
  averageRevenuePerOrder,
  isLoading,
  isVisible,
}: BigNumbersProps) {
  return (
    <>
      <NumberCard title="Total de vendas" value={ordersCount.toString()} isLoading={isLoading} isVisible={isVisible} />

      <NumberCard
        title="Receita total"
        value={formatCurrency(parseCentsToDecimal(revenue))}
        isLoading={isLoading}
        isVisible={isVisible}
      />

      <NumberCard
        title="Receita líquida"
        value={formatCurrency(parseCentsToDecimal(profit))}
        isLoading={isLoading}
        isVisible={isVisible}
      />

      <NumberCard title="Margem de lucro" value={`${margin.toFixed(2)}%`} isLoading={isLoading} isVisible={isVisible} />

      <NumberCard
        title="Valor médio por venda"
        value={formatCurrency(parseCentsToDecimal(averageRevenuePerOrder))}
        isLoading={isLoading}
        isVisible={isVisible}
      />
    </>
  )
}
