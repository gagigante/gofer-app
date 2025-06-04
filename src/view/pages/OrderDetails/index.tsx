import { useParams } from 'react-router-dom'

import { MainInfo } from './components/MainInfo'
import { ProductsTable } from './components/ProductsTable'
import { Address } from './components/Address'
import { Footer } from './components/Footer'
import { Loading } from './components/loading'

import { useOrder } from '@/view/hooks/queries/orders'
import { useAuth } from '@/view/hooks/useAuth'

export function OrderDetails() {
  const { order_id } = useParams()
  const { user } = useAuth()

  const { data, isLoading } = useOrder(
    {
      loggedUserId: user?.id ?? '',
      orderId: order_id ?? '',
    },
    {
      enabled: !!user && !!order_id,
    },
  )

  if (isLoading || !data) {
    return <Loading />
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-3 py-6 overflow-auto">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Detalhes do pedido</h2>

        <MainInfo
          customer={data.customer?.name ?? 'N/A'}
          totalCostPrice={data.totalCostPrice ?? 0}
          totalPrice={data.totalPrice ?? 0}
          createdAt={data.createdAt}
          obs={data.obs ?? 'N/A'}
        />

        <h3 className="mt-8 mb-4 text-lg font-semibold">Produtos do pedido</h3>
        <ProductsTable products={data.products} />

        <h3 className="mt-8 mb-4 text-lg font-semibold">Endereço da entrega</h3>
        <Address
          zipcode={data.zipcode || 'N/A'}
          city={data.city || 'N/A'}
          street={data.street || 'N/A'}
          neighborhood={data.neighborhood || 'N/A'}
          complement={data.complement || 'N/A'}
        />
      </div>

      <Footer orderId={order_id ?? ''} />
    </div>
  )
}
