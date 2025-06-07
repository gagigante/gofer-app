import { Fragment } from 'react'
import { Info } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/view/components/ui/tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Label } from '@/view/components/ui/label'
import { Textarea } from '@/view/components/ui/textarea'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

interface ProductsTableProps {
  products: Array<{
    productId: string | null
    name: string | null
    currentPrice: number | null
    costPrice: number | null
    price: number | null
    currentCostPrice: number | null
    customPrice: number | null
    quantity: number | null
    obs: string | null
  }>
}

const HeaderCell = ({
  children,
  tooltip,
  className,
}: {
  className: string
  children: React.ReactNode
  tooltip?: string
}) => {
  return (
    <TableHead className={className}>
      {children}
      {tooltip && (
        <Tooltip>
          <TooltipTrigger tabIndex={-1}>
            <div className="ml-2 rounded-full p-[2px]">
              <Info className="w-3 h-3" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      )}
    </TableHead>
  )
}

export function ProductsTable({ products }: ProductsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <HeaderCell className="min-w-[200px]">Nome</HeaderCell>
          <HeaderCell className="w-[150px]" tooltip="Esta coluna representa o preço de custo unitário atual">
            Preço de custo unitário atual
          </HeaderCell>
          <HeaderCell
            className="w-[150px]"
            tooltip="Esta coluna representa o preço de custo unitário praticado no momento da venda"
          >
            Preço de custo unitário
          </HeaderCell>
          <HeaderCell
            className="w-[150px]"
            tooltip="O preço de um produto pode variar. Esta coluna representa o preço atual de um produto"
          >
            Preço unitário atual
          </HeaderCell>
          <HeaderCell
            className="w-[150px]"
            tooltip="O preço de um produto pode variar. Esta coluna representa o preço atual de um produto"
          >
            Preço unitário
          </HeaderCell>
          <HeaderCell
            className="w-[150px]"
            tooltip="Esta coluna representa o preço de um produto praticado no momento da venda"
          >
            Preço unitário para o pedido
          </HeaderCell>
          <HeaderCell className="w-[150px]">Qtd.</HeaderCell>
        </TableRow>
      </TableHeader>

      <TableBody>
        {products.map(
          ({ productId, name, currentPrice, costPrice, price, currentCostPrice, customPrice, quantity, obs }) => (
            <Fragment key={productId}>
              <TableRow>
                <TableCell>
                  <p className="font-medium">{name}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{formatCurrency(parseCentsToDecimal(currentCostPrice ?? 0))}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{formatCurrency(parseCentsToDecimal(costPrice ?? 0))}</p>
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
                  <TableCell colSpan={7} className="py-4">
                    <div className="pl-4 space-y-2 border-l-2 border-border">
                      <Label htmlFor="obs">Notas do produto</Label>
                      <Textarea placeholder="Adicione uma nota opcional ao produto" value={obs} readOnly />
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ),
        )}
      </TableBody>
    </Table>
  )
}
