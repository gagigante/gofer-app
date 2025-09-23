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

interface ConfirmationDialogProps {
  isLoading: boolean
  actionType: 'order' | 'budget'
  hasDraft: boolean
  isOpen: boolean
  onConfirm: () => void
  onClose: () => void
}

const DIALOG_COPY = {
  order: {
    title: 'Confirmar criação do pedido',
    description: 'Você está realizando a criação de um PEDIDO, deseja mesmo continuar?',
  },
  budget: {
    title: 'Confirmar criação do orçamento',
    description: 'Você está realizando a criação de um ORÇAMENTO, deseja mesmo continuar?',
  },
  budgetEdit: {
    title: 'Confirmar edição do orçamento',
    description: 'Você está realizando a edição de um ORÇAMENTO, deseja mesmo continuar?',
  },
} as const

export const ConfirmationDialog = ({
  isLoading,
  actionType,
  hasDraft,
  isOpen,
  onConfirm,
  onClose,
}: ConfirmationDialogProps) => {
  const copy = (() => {
    if (hasDraft) {
      return DIALOG_COPY.budgetEdit
    }

    return DIALOG_COPY[actionType]
  })()

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent onKeyDown={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>{copy.title}</AlertDialogTitle>
          <AlertDialogDescription>{copy.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" disabled={isLoading} onClick={onClose} autoFocus>
            Cancelar
          </Button>

          <Button onClick={onConfirm} disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
            Confirmar
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
