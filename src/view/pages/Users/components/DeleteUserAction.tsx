import React from 'react'

import { Button } from '@/view/components/ui/button'
import { Alert } from '@/view/components/Alert'

interface DeleteUserActionProps {
  isOpen: boolean
  onDelete: () => Promise<void>
  onClose: () => void
}

export const DeleteUserAction = ({ isOpen, onDelete, onClose }: DeleteUserActionProps) => {
  return (
    <Alert
      isOpen={isOpen}
      title="Apagar usuário"
      description="Deseja mesmo apagar o usuário?"
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
