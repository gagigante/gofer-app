import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

import { type Order } from '@/api/db/schema'

interface OrdersTableProps {
  orders: Order[]
}

const FORMATTER = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
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

              <TableCell></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
  )
}