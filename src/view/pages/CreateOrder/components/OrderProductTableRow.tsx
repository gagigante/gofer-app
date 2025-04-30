import { useState } from 'react'
import { FaTrash } from 'react-icons/fa'
import { Pen, PenOff } from 'lucide-react'

import { Tooltip, TooltipTrigger, TooltipContent } from '@/view/components/ui/tooltip'
import { Button } from '@/view/components/ui/button'
import { Input } from '@/view/components/ui/input'
import { Label } from '@/view/components/ui/label'
import { TableRow, TableCell } from '@/view/components/ui/table'
import { Textarea } from '@/view/components/ui/textarea'
import { QuantityPicker } from './QuantityPicker'

import { formatCurrency, formatDecimal } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

interface OrderProductTableRowProps {
  id: string
  name: string
  unityPrice: number
  customPrice: number
  quantity: number
  totalPrice: number
  onRequestPriceUpdate: (id: string, price: number) => void
  onRequestQuantityUpdate: (id: string, quantity: number) => void
  onRequestRemove: (id: string) => void
  onRequestNoteUpdate: (id: string, note: string) => void
}

export function OrderProductTableRow({
  id,
  name,
  unityPrice,
  customPrice,
  quantity,
  totalPrice,
  onRequestPriceUpdate,
  onRequestQuantityUpdate,
  onRequestRemove,
  onRequestNoteUpdate,
}: OrderProductTableRowProps) {
  const [productNote, setProductNote] = useState<string | undefined>(undefined)
  const [hasNote, setHasNote] = useState(false)

  return (
    <>
      <TableRow>
        <TableCell>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="font-medium line-clamp-1">{name}</p>
            </TooltipTrigger>

            <TooltipContent>
              <p>{name}</p>
            </TooltipContent>
          </Tooltip>
        </TableCell>

        <TableCell>
          <p className="font-medium">{formatCurrency(parseCentsToDecimal(unityPrice))}</p>
        </TableCell>

        <TableCell>
          <Input
            value={formatDecimal(customPrice / 100)}
            onChange={(e) => {
              const number = Number(e.target.value.replace(',', ''))
              if (Number.isNaN(number)) {
                e.target.value = '0,00'
                onRequestPriceUpdate(id, 0)
                return
              }

              const formatted = formatDecimal(number / 100)
              e.target.value = formatted
              onRequestPriceUpdate(id, number)
            }}
          />
        </TableCell>

        <TableCell>
          <QuantityPicker onChange={(value) => onRequestQuantityUpdate(id, value)} value={quantity} />
        </TableCell>

        <TableCell>
          <p className="font-medium">{formatCurrency(parseCentsToDecimal(totalPrice))}</p>
        </TableCell>

        <TableCell className="flex items-center justify-end gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const updatedHasNote = !hasNote

                  if (!updatedHasNote) {
                    setProductNote(undefined)
                  }
                  setHasNote(updatedHasNote)
                }}
              >
                {hasNote ? <PenOff className="w-3 h-3" /> : <Pen className="w-3 h-3" />}
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              <p>{hasNote ? 'Remover nota do produto no pedido' : 'Adicionar nota ao produto no pedido'}</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="destructive" size="sm" onClick={() => onRequestRemove(id)}>
                <FaTrash className="w-3 h-3" />
              </Button>
            </TooltipTrigger>

            <TooltipContent>
              <p>Remover produto do pedido</p>
            </TooltipContent>
          </Tooltip>
        </TableCell>
      </TableRow>

      {hasNote && (
        <TableRow>
          <TableCell colSpan={6} className="py-4">
            <div className="pl-4 space-y-2 border-l-2 border-border">
              <Label htmlFor="obs">Notas do produto</Label>
              <Textarea
                placeholder="Adicione uma nota opcional ao produto"
                value={productNote}
                onChange={(e) => {
                  setProductNote(e.target.value)
                  onRequestNoteUpdate(id, e.target.value)
                }}
              />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  )
}
