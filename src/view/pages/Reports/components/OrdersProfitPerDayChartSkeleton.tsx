import { Card, CardContent, CardHeader } from '@/view/components/ui/card'
import { Skeleton } from '@/view/components/ui/skeleton'

export function OrdersProfitPerDayChartSkeleton() {
  return (
    <Card>
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <Skeleton className="h-7 w-96" />
          <Skeleton className="h-5 w-[500px]" />
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <Skeleton className="h-[250px] w-full rounded-lg" />
      </CardContent>
    </Card>
  )
}
