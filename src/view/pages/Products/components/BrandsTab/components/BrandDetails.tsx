import { Input } from '@/view/components/ui/input'
import { Label } from '@/view/components/ui/label'
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/view/components/ui/table'
import { Dialog } from '@/view/components/Dialog'

import { useBrand } from '@/view/hooks/queries/brands'
import { useAuth } from '@/view/hooks/useAuth'

import { formatCurrency } from '@/view/utils/formatters'
import { parseCentsToDecimal } from '@/view/utils/parsers'

interface BrandDetailsProps {
  brandId?: string
  isOpen: boolean
  onClose: () => void
}

export function BrandDetails({ brandId, isOpen, onClose }: BrandDetailsProps) {
  const { user } = useAuth()

  const { data } = useBrand(
    {
      loggedUserId: user?.id ?? '',
      brandId: brandId ?? '',
    },
    {
      enabled: !!user && !!brandId,
    },
  )
  const products = data?.products ?? []

  return (
    <Dialog
      className="max-w-[780px]"
      title="Detalhes da marca"
      cancelButtonLabel="Fechar"
      open={isOpen}
      onClose={() => {
        onClose()
      }}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start gap-3">
          <Label htmlFor="name" className="text-right">
            Nome *
          </Label>
          <Input placeholder="Nome da marca" className="col-span-3" value={data?.name ?? ''} readOnly disabled />
        </div>

        <Table>
          {products.length === 0 && <TableCaption>Nenhum produto encontrado.</TableCaption>}

          <TableHeader>
            <TableRow>
              <TableHead>ID. rápido</TableHead>
              <TableHead>Cód. de barras</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Qtd. disponível em estoque</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {products.map(({ id, fastId, barCode, name, price, availableQuantity }) => (
              <TableRow key={id}>
                <TableCell>
                  <p className="font-medium">{fastId}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{barCode || 'N/A'}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{name}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{formatCurrency(parseCentsToDecimal(price ?? 0))}</p>
                </TableCell>

                <TableCell>
                  <p className="font-medium">{availableQuantity}</p>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Dialog>
  )
}
