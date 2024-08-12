import React from 'react'
import { FaTrash } from 'react-icons/fa'

import { Button } from '@/view/components/ui/button'
import { Alert } from '@/view/components/Alert'

interface DeleteUserActionProps {
  isDeletable: boolean
  onDelete: () => Promise<void>
}

export const DeleteUserAction = ({ isDeletable, onDelete }: DeleteUserActionProps) => {
  return (
    <Alert
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
      trigger={
        <Button variant="destructive" size="sm" disabled={!isDeletable}>
          <FaTrash className="w-3 h-3" />
        </Button>
      }
    />
  )
}
