import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Button } from '@/view/components/ui/button'
import { Footer } from '@/view/components/Footer'
import { Kbd } from '@/view/components/Kbd'
import { OrdersTable } from './components/OrdersTable'

import { useOrders } from '@/view/hooks/queries/orders'
import { useAuth } from '@/view/hooks/useAuth'
import { useHotkey } from '@/view/hooks/useHotkey'

export function Orders() {
  const { user } = useAuth()
  const navigate = useNavigate()

  useHotkey('shift+n', () => {
    navigate('new')
  })

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

      <Footer page={pagination} total={data?.total ?? 0} onChange={setPagination}>
        <Button asChild>
          <Link to="new">
            Adicionar novo pedido
            <Kbd className="ml-2">shift</Kbd>+<Kbd>n</Kbd>
          </Link>
        </Button>
      </Footer>
    </div>
  )
}
