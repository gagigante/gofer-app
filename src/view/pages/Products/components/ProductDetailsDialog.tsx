import { Dialog } from '@/view/components/Dialog'
import { Input } from '@/view/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/view/components/ui/select'
import { Card } from '@/view/components/ui/card'
import { Textarea } from '@/view/components/ui/textarea'
import { Label } from '@/view/components/ui/label'

import { formatCEST, formatCurrency, formatDecimal, formatNCM } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

import { type Category, type Product } from '@/api/db/schema'

interface ProductDetailsDialogProps {
  product?: Product & { category: Category | null }
  isOpen: boolean
  onRequestEdit: (product: Product & { category: Category | null }) => void
  onClose: () => void
}

export function ProductDetailsDialog({ product, isOpen, onRequestEdit, onClose }: ProductDetailsDialogProps) {
  const profitMargin = (() => {
    if (!product) return

    const costPriceNumber = (product.costPrice ?? 0) * 100
    const priceNumber = (product.price ?? 0) * 100

    const profit = priceNumber - costPriceNumber
    const profitMargin = (profit / costPriceNumber) * 100

    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(profitMargin)
  })()

  return (
    <Dialog
      className="max-w-[780px]"
      title="Detalhes do produto"
      onProceed={() => {
        if (!product) return

        onRequestEdit(product)
      }}
      proceedButtonLabel="Editar o produto"
      cancelButtonLabel="Fechar"
      open={isOpen}
      onClose={() => {
        onClose()
      }}
    >
      <div className="space-y-6">
        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-4">
            <Label htmlFor="name">Nome *</Label>

            <Input id="name" value={product?.name ?? ''} readOnly disabled />
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <Label>Categoria</Label>
            <Select value={product?.category?.id ?? 'N/A'} disabled>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={product?.category?.id ?? 'N/A'}>{product?.category?.name ?? 'N/A'}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <Label>Marca</Label>
            <Input value={product?.brand || 'N/A'} readOnly disabled />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <Label>Description</Label>
          <Textarea value={product?.description || 'N/A'} readOnly disabled />
        </div>

        <div className="flex-1 flex flex-col gap-4">
          <Label>Código de barras</Label>
          <Input value={product?.barCode || 'N/A'} readOnly disabled />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-4">
            <Label>Preço de custo *</Label>
            <Input value={formatCurrency(parseCentsToDecimal(product?.costPrice ?? 0))} readOnly disabled />
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <Label>Preço *</Label>
            <Input value={formatCurrency(parseCentsToDecimal(product?.price ?? 0))} readOnly disabled />
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <Label>Margem de lucro (%)</Label>
            <Input value={profitMargin} readOnly disabled />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-4">
            <Label>Quantidade disponível em estoque</Label>
            <Input value={product?.availableQuantity ?? 0} readOnly disabled />
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <Label>Quantidade mínima para estoque</Label>
            <Input value={product?.minimumQuantity ?? 0} readOnly disabled />
          </div>
        </div>

        <Card className="p-4 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 flex flex-col gap-4">
              <Label>ICMS (%) *</Label>
              <Input value={formatDecimal(String(parseCentsToDecimal(product?.icms ?? 0)))} readOnly disabled />
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <Label>NCM *</Label>
              <Input value={formatNCM(product?.ncm ?? '')} readOnly disabled />
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <Label>CEST *</Label>
              <Input value={formatCEST(product?.cest ?? '')} readOnly disabled />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <Label htmlFor="cestSegment">CEST - Segmento</Label>
            <Input id="cestSegment" value={product?.cestSegment ?? 'N/A'} readOnly disabled />
          </div>

          <div>
            <Label htmlFor="cestDescription">CEST - Descrição</Label>
            <Textarea id="cestDescription" value={product?.cestDescription ?? 'N/A'} readOnly disabled />
          </div>
        </Card>
      </div>
    </Dialog>
  )
}
