import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '@/view/components/ui/button'
import { Label } from '@/view/components/ui/label'
import { Input } from '@/view/components/ui/input'
import { Card } from '@/view/components/ui/card'

import { useCustomer } from '@/view/hooks/queries/customers'
import { useAuth } from '@/view/hooks/useAuth'
import { formatCNPJ, formatCPF, formatPhone, formatRG } from '@/view/utils/formatters'
import { useOrders } from '@/view/hooks/queries/orders'
import { Footer } from '@/view/components/Footer'
import { OrdersTable } from '../Orders/components/OrdersTable'

export function CustomerDetails() {
  const { customer_id } = useParams()
  const { user } = useAuth()

  const [pagination, setPagination] = useState(1)

  const { data: customer } = useCustomer(
    { loggedUserId: user?.id ?? '', customerId: customer_id ?? '' },
    { enabled: !!user?.id && !!customer_id },
  )

  const { data: ordersResponse } = useOrders(
    { loggedUserId: user?.id ?? '', customerId: customer_id ?? '', filters: { draft: false } },
    { enabled: !!user?.id && !!customer_id },
  )
  const orders = ordersResponse?.orders ?? []

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 px-3 py-6 overflow-auto">
        <h2 className="mb-8 text-3xl font-semibold tracking-tight transition-colors">Detalhes do cliente</h2>

        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Nome *</Label>
              <Input value={customer?.name || 'N/A'} disabled readOnly />
            </div>

            <div className="flex-1">
              <Label>Telefone</Label>
              <Input value={formatPhone(customer?.phone ?? '') || 'N/A'} disabled readOnly />
            </div>

            <div className="flex-1">
              <Label>E-mail</Label>
              <Input value={customer?.email || 'N/A'} disabled readOnly />
            </div>
          </div>

          <Card className="p-4 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>RG</Label>
                <Input value={formatRG(customer?.rg ?? '') || 'N/A'} disabled readOnly />
              </div>

              <div className="flex-1">
                <Label>CPF</Label>
                <Input value={formatCPF(customer?.cpf ?? '') || 'N/A'} disabled readOnly />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label>CNPJ</Label>
                <Input value={formatCNPJ(customer?.cnpj ?? '') || 'N/A'} disabled readOnly />
              </div>

              <div className="flex-1">
                <Label>Inscrição Estadual (IE)</Label>
                <Input value={customer?.ie || 'N/A'} disabled readOnly />
              </div>
            </div>
          </Card>

          <Card className="p-4 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>CEP</Label>
                <Input value={customer?.zipcode || 'N/A'} disabled readOnly />
              </div>

              <div className="flex-1">
                <Label>Cidade</Label>
                <Input value={customer?.city || 'N/A'} disabled readOnly />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Logradouro</Label>
                <Input value={customer?.street || 'N/A'} disabled readOnly />
              </div>

              <div className="flex-1">
                <Label>Bairro</Label>
                <Input value={customer?.neighborhood || 'N/A'} disabled readOnly />
              </div>

              <div className="flex-1">
                <Label>Complemento</Label>
                <Input value={customer?.complement || 'N/A'} disabled readOnly />
              </div>
            </div>
          </Card>
        </div>

        <h3 className="mt-8 mb-4 text-2xl font-semibold tracking-tight transition-colors">Pedidos do cliente</h3>

        <OrdersTable orders={orders} />
      </div>

      <Footer page={pagination} total={ordersResponse?.total ?? 0} onChange={setPagination}>
        <Button variant="outline" asChild>
          <Link to=".." relative="path">
            Voltar
          </Link>
        </Button>
      </Footer>
    </div>
  )
}
