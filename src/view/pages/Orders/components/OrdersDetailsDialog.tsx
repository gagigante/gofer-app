import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Dialog } from '@/view/components/Dialog'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

import { useOrder } from '@/view/hooks/queries/orders'
import { useAuth } from '@/view/hooks/useAuth'

interface OrdersDetailsDialogProps {
  orderId?: string
  isOpen: boolean
  onClose: () => void
}

const FORMATTER = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })

export function OrdersDetailsDialog({ orderId, isOpen, onClose }: OrdersDetailsDialogProps) {
  const { user } = useAuth()

  const { data } = useOrder({
    loggedUserId: user?.id ?? '',
    orderId: orderId ?? '',
  }, {
    enabled: !!user && !!orderId
  })

  return (
    <Dialog
      className="max-w-[780px]"
      title="Detalhes do pedido"
      cancelButtonLabel="Fechar"
      open={isOpen}
      onClose={() => {
        onClose()
      }}
    >
      {data && (
        <div className="mb-4 gap-4">
          <p className="font-medium"><b>Preço total:</b> {formatCurrency(parseCentsToDecimal(data.totalPrice ?? 0))}</p>
          <p className="font-medium"><b>Data do pedido:</b> {FORMATTER.format(new Date(data.createdAt + ' UTC'))}</p>
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Código de barras</TableHead>
            <TableHead>Preço unitário</TableHead>
            <TableHead>Quantidade</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data?.products.map(({ productId, name, barCode, price, quantity }) => (
            <TableRow key={productId}>
              <TableCell>
                <p className="font-medium">{name}</p>
              </TableCell>

              <TableCell>
                <p className="font-medium">{barCode || 'N/A'}</p>
              </TableCell>

              <TableCell>
                <p className="font-medium">{formatCurrency(parseCentsToDecimal(price ?? 0))}</p>
              </TableCell>

              <TableCell>
                <p className="font-medium">{quantity}</p>
              </TableCell>             
            </TableRow>
          ))}
        </TableBody>
      </Table>     
    </Dialog>
  )
}
