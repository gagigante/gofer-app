import { TabsContent } from '@/view/components/ui/tabs'
import { OrdersTable } from '@/view/components/OrdersTable'

import { type OrderWithCustomer } from '@/api/repositories/orders-repository'

interface OrdersTabProps {
  orders: OrderWithCustomer[]
}

export function OrdersTab({ orders }: OrdersTabProps) {
  return (
    <TabsContent className="mt-[4.5rem]" value="orders">
      <OrdersTable orders={orders} />
    </TabsContent>
  )
}
