import { Skeleton } from '@/view/components/ui/skeleton'

interface TableLoadingProps {
  columns: number
  rows: number
}

export function TableLoading({ columns, rows }: TableLoadingProps) {
  return (
    <div className="border rounded-lg">
      <div className="border-b p-4">
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-5 w-full" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
