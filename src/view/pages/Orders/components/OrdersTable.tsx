import { useState } from 'react'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { FaEye } from 'react-icons/fa'

import { Button } from '@/view/components/ui/button'
import { OrdersDetailsDialog } from './OrdersDetailsDialog'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

import { type Order } from '@/api/db/schema'

interface OrdersTableProps {
  orders: Order[]
}

const FORMATTER = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })

export function OrdersTable({ orders }: OrdersTableProps) {
  const [selectedOrder, setSelectedOrder] = useState<string>()
  const [isOrderDetailsDialogOpen, setIsOrderDetailsDialogOpen] = useState(false)

  return (
    <>
      <Table>
        {orders.length === 0 && <TableCaption>Nenhum pedido encontrado.</TableCaption>} 

        <TableHeader>
          <TableRow>
            <TableHead>Preço do pedido</TableHead>
            <TableHead>Data do pedido</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {orders.map(({ id, totalPrice, createdAt }) => (
            <TableRow key={id}>
              <TableCell>
                <p className="font-medium">{formatCurrency(parseCentsToDecimal(totalPrice ?? 0))}</p>
              </TableCell>

              <TableCell>
                <p className="font-medium">{FORMATTER.format(new Date(createdAt + ' UTC'))}</p>
              </TableCell>

              <TableCell className="flex-nowrap text-right space-x-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedOrder(id)
                    setIsOrderDetailsDialogOpen(true)
                  }}
                >
                  <FaEye className="w-3 h-3" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <OrdersDetailsDialog
        orderId={selectedOrder}
        isOpen={isOrderDetailsDialogOpen}
        onClose={() => setIsOrderDetailsDialogOpen(false)}
      />
    </>
  )
}