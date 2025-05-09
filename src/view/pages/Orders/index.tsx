import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Tabs, TabsList, TabsTrigger } from '@/view/components/ui/tabs'
import { Button } from '@/view/components/ui/button'
import { Footer } from '@/view/components/Footer'
import { OrdersTab } from './components/OrdersTab'
import { DraftsTab } from './components/DraftsTab'

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

        <Tabs defaultValue="orders" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="orders">Pedidos realizados</TabsTrigger>
            <TabsTrigger value="drafts">Rascunhos</TabsTrigger>
          </TabsList>

          <OrdersTab orders={orders} />
          <DraftsTab />
        </Tabs>
      </div>

      <Footer page={pagination} total={data?.total ?? 0} onChange={setPagination}>
        <Button asChild>
          <Link to="new">Adicionar novo pedido</Link>
        </Button>
      </Footer>
    </div>
  )
}
