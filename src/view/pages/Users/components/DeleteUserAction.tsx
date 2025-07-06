import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/view/components/ui/button'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/view/components/ui/alert-dialog'

interface DeleteUserActionProps {
  isOpen: boolean
  onDelete: () => Promise<void>
  onClose: () => void
}

export const DeleteUserAction = ({ isOpen, onDelete, onClose }: DeleteUserActionProps) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent onKeyDown={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Apagar usuário</AlertDialogTitle>
          <AlertDialogDescription>Deseja mesmo apagar o usuário?</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" disabled={isLoading} onClick={onClose} autoFocus>
            Cancelar
          </Button>

          <Button
            variant="destructive"
            onClick={async () => {
              setIsLoading(true)
              await onDelete()
              onClose()
              setIsLoading(false)
            }}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
            Apagar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
