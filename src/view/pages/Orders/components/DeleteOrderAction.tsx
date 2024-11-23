import { Button } from '@/view/components/ui/button'
import { Alert } from '@/view/components/Alert'

interface DeleteOrderActionProps {
  isOpen: boolean
  onDelete: () => Promise<void>
  onClose: () => void
}

export function DeleteOrderAction({ isOpen, onDelete, onClose }: DeleteOrderActionProps) {
  return (
    <Alert
      isOpen={isOpen}
      title="Apagar pedido"
      description="Deseja mesmo apagar este pedido?"
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
