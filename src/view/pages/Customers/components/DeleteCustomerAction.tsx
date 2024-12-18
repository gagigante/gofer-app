import { Button } from '@/view/components/ui/button'
import { Alert } from '@/view/components/Alert'

interface DeleteCustomerActionProps {
  isOpen: boolean
  onDelete: () => Promise<void>
  onClose: () => void
}

export const DeleteCustomerAction = ({ isOpen, onDelete, onClose }: DeleteCustomerActionProps) => {
  return (
    <Alert
      isOpen={isOpen}
      title="Apagar cliente"
      description={`
        Deseja mesmo apagar este cliente?
        Ao remover o cliente, os pedidos associados a ele deixarão de ter um cliente associado.
      `}
      cancelButton={<Button variant="outline">Cancelar</Button>}
      proceedButton={
        <Button
          variant="destructive"
          onClick={async () => {
            await onDelete()
          }}
        >
          Apagar
        </Button>
      }
      onClose={onClose}
    />
  )
}
