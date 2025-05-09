import { Fragment } from 'react'
import { FaInfo } from 'react-icons/fa'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/view/components/ui/tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Label } from '@/view/components/ui/label'
import { Textarea } from '@/view/components/ui/textarea'
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

  const { data } = useOrder(
    {
      loggedUserId: user?.id ?? '',
      orderId: orderId ?? '',
    },
    {
      enabled: !!user && !!orderId,
    },
  )

  return (
    <Dialog
      title="Detalhes do pedido"
      cancelButtonLabel="Fechar"
      open={isOpen}
      onClose={() => {
        onClose()
      }}
    >
      {data && (
        <>
          <div className="mb-4 gap-4">
            <p className="font-medium">
              <b>Cliente:</b> {data.customer?.name ?? 'N/A'}
            </p>
            <p className="font-medium">
              <b>Preço total:</b> {formatCurrency(parseCentsToDecimal(data.totalPrice ?? 0))}
            </p>
            <p className="font-medium">
              <b>Data do pedido:</b> {FORMATTER.format(new Date(data.createdAt + ' UTC'))}
            </p>
          </div>

          <div className="grid w-full gap-1.5 my-4">
            <Label htmlFor="obs">Observações</Label>
            <Textarea placeholder="Observações" id="obs" readOnly value={data.obs || 'N/A'} />
          </div>
        </>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Código de barras</TableHead>
            <TableHead>
              Preço unitário atual
              <Tooltip>
                <TooltipTrigger tabIndex={-1}>
                  <div className="ml-2 rounded-full border p-[2px]">
                    <FaInfo className="w-2 h-2" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>O preço de um produto pode variar. Esta coluna representa o preço atual de um produto</p>
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead>
              Preço unitário
              <Tooltip>
                <TooltipTrigger tabIndex={-1}>
                  <div className="ml-2 rounded-full border p-[2px]">
                    <FaInfo className="w-2 h-2" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Esta coluna representa o preço original de um produto no momento da venda</p>
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead>
              Preço unitário para o pedido
              <Tooltip>
                <TooltipTrigger tabIndex={-1}>
                  <div className="ml-2 rounded-full border p-[2px]">
                    <FaInfo className="w-2 h-2" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Esta coluna representa o preço de um produto praticado no momento da venda</p>
                </TooltipContent>
              </Tooltip>
            </TableHead>
            <TableHead>Quantidade</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data?.products.map(({ productId, name, barCode, currentPrice, price, customPrice, quantity, obs }) => (
            <Fragment key={productId}>
              <TableRow>
                <TableCell>
                  <p className="font-medium">{name}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{barCode || 'N/A'}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{formatCurrency(parseCentsToDecimal(currentPrice ?? 0))}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{formatCurrency(parseCentsToDecimal(price ?? 0))}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{formatCurrency(parseCentsToDecimal(customPrice ?? 0))}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{quantity}</p>
                </TableCell>
              </TableRow>

              {obs && (
                <TableRow>
                  <TableCell colSpan={6} className="py-4">
                    <div className="pl-4 space-y-2 border-l-2 border-border">
                      <Label htmlFor="obs">Notas do produto</Label>
                      <Textarea placeholder="Adicione uma nota opcional ao produto" value={obs} readOnly />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </Dialog>
  )
}
