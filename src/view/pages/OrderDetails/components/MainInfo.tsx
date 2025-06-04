import { Label } from '@/view/components/ui/label'
import { Textarea } from '@/view/components/ui/textarea'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

interface MainInfoProps {
  customer: string
  totalCostPrice: number
  totalPrice: number
  obs: string
  createdAt: string | null
}

const FORMATTER = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })

export function MainInfo({ customer, totalCostPrice, totalPrice, createdAt, obs }: MainInfoProps) {
  return (
    <>
      <div className="mb-8 space-y-2">
        <p className="font-medium">
          <b>Cliente:</b> {customer}
        </p>
        <p className="font-medium">
          <b>Preço de custo total:</b> {formatCurrency(parseCentsToDecimal(totalCostPrice))}
        </p>
        <p className="font-medium">
          <b>Preço total:</b> {formatCurrency(parseCentsToDecimal(totalPrice))}
        </p>
        <p className="font-medium">
          <b>Data do pedido:</b> {FORMATTER.format(new Date(createdAt + ' UTC'))}
        </p>
      </div>

      <div className="grid w-full gap-1.5 my-4">
        <Label htmlFor="obs">Observações</Label>
        <Textarea placeholder="Observações" id="obs" readOnly value={obs} />
      </div>
    </>
  )
}
