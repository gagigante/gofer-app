import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Info } from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/view/components/ui/alert'
import { Button } from '@/view/components/ui/button'
import { Footer } from '@/view/components/Footer'
import { BudgetsTable } from './components/BudgetsTable'

import { useAuth } from '@/view/hooks/useAuth'
import { useOrders } from '@/view/hooks/queries/orders'

export function Budgets() {
  const { user } = useAuth()

  const [pagination, setPagination] = useState(1)

  const { data, isFetching } = useOrders(
    { loggedUserId: user?.id ?? '', page: pagination, filters: { draft: true } },
    {
      enabled: !!user,
      placeholderData: (previousData) => previousData,
    },
  )
  const orders = data?.orders ?? []

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-3 py-6 overflow-auto">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Orçamentos</h2>

        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Orçamentos</AlertTitle>
          <AlertDescription>Crie orçamentos antes de transforma-los em pedidos.</AlertDescription>
        </Alert>

        <BudgetsTable orders={orders} isLoading={isFetching} />
      </div>

      <Footer page={pagination} total={data?.total ?? 0} onChange={setPagination}>
        <Button asChild>
          <Link to="/home/orders/new" state={{ draft: true }}>
            Adicionar novo orçamento
          </Link>
        </Button>
      </Footer>
    </div>
  )
}
