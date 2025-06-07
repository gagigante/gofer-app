import { Card } from '@/view/components/ui/card'
import { Label } from '@/view/components/ui/label'
import { Input } from '@/view/components/ui/input'

interface AddressProps {
  zipcode: string
  city: string
  street: string
  neighborhood: string
  complement: string
}

export function Address({ zipcode, city, street, neighborhood, complement }: AddressProps) {
  return (
    <Card className="p-4 space-y-4">
      <div className="flex gap-4">
        <div className="flex-1">
          <Label>CEP</Label>
          <Input value={zipcode} readOnly />
        </div>

        <div className="flex-1">
          <Label>Cidade</Label>
          <Input value={city} readOnly />
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Label>Logradouro</Label>
          <Input value={street} readOnly />
        </div>

        <div className="flex-1">
          <Label>Bairro</Label>
          <Input value={neighborhood} readOnly />
        </div>

        <div className="flex-1">
          <Label>Complemento</Label>
          <Input value={complement} readOnly />
        </div>
      </div>
    </Card>
  )
}
