import { Button } from '@/view/components/ui/button'
import { Alert } from '@/view/components/Alert'

interface DeleteDraftOrderActionProps {
  isOpen: boolean
  onDelete: () => void
  onClose: () => void
}

export function DeleteDraftOrderAction({ isOpen, onDelete, onClose }: DeleteDraftOrderActionProps) {
  return (
    <Alert
      isOpen={isOpen}
      title="Apagar rascunho"
      description="Deseja mesmo apagar este rascunho?"
      cancelButton={<Button variant="outline">Cancelar</Button>}
      proceedButton={
        <Button variant="destructive" onClick={onDelete}>
          Apagar
        </Button>
      }
      onClose={onClose}
    />
  )
}
