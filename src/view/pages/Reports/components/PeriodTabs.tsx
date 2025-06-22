import { Tabs, TabsList, TabsTrigger } from '@/view/components/ui/tabs'

import { type PeriodValue } from '@/api/controllers/reports-controller'

const PERIODS: Array<{ label: string; value: PeriodValue }> = [
  {
    label: 'Mês atual',
    value: 'current_month',
  },
  {
    label: 'Últimos 7 dias',
    value: 'last_7_days',
  },
  {
    label: 'Últimos 30 dias',
    value: 'last_30_days',
  },
  {
    label: 'Últimos 3 meses',
    value: 'last_90_days',
  },
] as const

interface PeriodTabsProps {
  value: PeriodValue
  onValueChange: (value: PeriodValue) => void
}

export function PeriodTabs({ value, onValueChange }: PeriodTabsProps) {
  return (
    <Tabs value={value} onValueChange={(value) => onValueChange(value as PeriodValue)} className="mb-4">
      <TabsList>
        {PERIODS.map((period) => (
          <TabsTrigger className="w-[128px]" value={period.value} key={period.value}>
            {period.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
