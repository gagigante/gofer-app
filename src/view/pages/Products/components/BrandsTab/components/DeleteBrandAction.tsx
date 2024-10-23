import { Button } from '@/view/components/ui/button'
import { Alert } from '@/view/components/Alert'

interface DeleteBrandActionProps {
  isOpen: boolean
  onDelete: () => Promise<void>
  onClose: () => void
}

export const DeleteBrandAction = ({ isOpen, onDelete, onClose }: DeleteBrandActionProps) => {
  return (
    <Alert
      isOpen={isOpen}
      title="Apagar marca"
      description={`
        Deseja mesmo apagar esta marca?
        Ao remover a marca, os produtos associados a ela deixarão de ter uma marca associada.
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
