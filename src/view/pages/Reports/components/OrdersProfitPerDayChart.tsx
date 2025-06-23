import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/view/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/view/components/ui/chart'
import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

const CHART_CONFIG = {
  total: {
    label: 'Preço de venda',
    color: 'var(--chart-2)',
  },
  cost: {
    label: 'Preço de custo',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

interface OrdersProfitPerDayChartProps {
  data: Array<{ date: string; total: number; cost: number }>
  isVisible: boolean
}

const FORMATTER = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' })

export function OrdersProfitPerDayChart({ data, isVisible }: OrdersProfitPerDayChartProps) {
  const formattedData = isVisible
    ? data.map((item) => ({
        date: FORMATTER.format(new Date(`${item.date}T12:00:00`)),
        cost: parseCentsToDecimal(item.cost),
        total: parseCentsToDecimal(item.total),
      }))
    : Array.from({ length: data.length }, (_, index) => ({
        date: FORMATTER.format(new Date(`${data[index].date}T12:00:00`)),
        cost: 0,
        total: 0,
      }))

  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-xl">Preço de custo x Preço de venda por dia</CardTitle>

          <CardDescription>
            Este gráfico mostra o preço de custo e o preço de venda de cada pedido ao longo do período selecionado.
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="px-4 pt-4 sm:px-4 sm:pt-6">
        <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[250px] w-full">
          <AreaChart data={formattedData} height={250} width={1000}>
            <defs>
              <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0.1} />
              </linearGradient>

              <linearGradient id="fillCost" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid vertical={false} />

            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent formatter={(value) => formatCurrency(value as number)} indicator="line" />}
            />

            <YAxis
              width={80}
              tickLine={false}
              axisLine={false}
              tickMargin={0}
              tickFormatter={(value) => formatCurrency(value)}
            />

            <Area dataKey="cost" type="monotone" fill="url(#fillCost)" stroke="var(--chart-1)" stackId="1" />
            <Area dataKey="total" type="monotone" fill="url(#fillTotal)" stroke="var(--chart-2)" stackId="1" />

            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
