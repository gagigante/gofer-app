import React from 'react'

import { Button } from '@/view/components/ui/button'
import { Alert } from '@/view/components/Alert'

interface DeleteCategoryActionProps {
  isOpen: boolean
  onDelete: () => Promise<void>
  onClose: () => void
}

export const DeleteCategoryAction = ({ isOpen, onDelete, onClose }: DeleteCategoryActionProps) => {
  return (
    <Alert
      isOpen={isOpen}
      title="Apagar categoria"
      description={`
        Deseja mesmo apagar o usuário?
        Ao remover a categoria, os produtos associados a ela deixarão de ter uma categoria associada.
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
