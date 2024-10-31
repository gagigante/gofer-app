import { useState } from 'react'

import { OrdersTable } from './components/OrdersTable'
import { Footer } from './components/Footer'

import { useOrders } from '@/view/hooks/queries/orders'
import { useAuth } from '@/view/hooks/useAuth'

export function Orders() {
  const { user } = useAuth()

  const [pagination, setPagination] = useState(1)

  const { data } = useOrders(
    { loggedUserId: user?.id ?? '', page: pagination },
    {
      enabled: !!user,
      placeholderData: (previousData) => previousData,
    },
  )
  const orders = data?.orders ?? []

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-3 py-6 overflow-auto">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Pedidos</h2>

        <OrdersTable orders={orders} />
      </div>

      <Footer page={pagination} total={data?.total ?? 0} onChange={setPagination} />
    </div>
  )
}
