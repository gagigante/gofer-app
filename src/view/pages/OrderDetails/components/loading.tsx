import * as React from 'react'
import { Skeleton } from '@/view/components/ui/skeleton'
import { Card } from '@/view/components/ui/card'
import { TableLoading } from '@/view/components/TableLoading'

export function Loading() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-3 py-6 overflow-auto">
        <Skeleton className="h-9 w-64 mb-8" />
        <div className="mb-8 space-y-2">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-56" />
        </div>
        <div className="grid w-full gap-1.5 my-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-6 w-48 mt-8 mb-4" />
        <TableLoading columns={7} rows={3} />
        <Skeleton className="h-6 w-48 mt-8 mb-4" />
        <Card className="p-4 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Skeleton className="h-4 w-12 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="flex-1">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="flex-1">
              <Skeleton className="h-4 w-16 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>

            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </Card>
      </div>

      <footer className="flex px-3 py-4 border-t border-border">
        <Skeleton className="h-10 w-48 ml-auto mr-2" />
        <Skeleton className="h-10 w-24" />
      </footer>
    </div>
  )
}
