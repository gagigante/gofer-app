import { type ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/view/components/ui/alert-dialog'

interface DialogProps {
  isOpen: boolean
  title: string
  description?: string
  cancelButton: ReactNode
  proceedButton: ReactNode
  onClose: () => void
}

export function Alert({ title, description, cancelButton, proceedButton, isOpen, onClose }: DialogProps) {
  return (
    <AlertDialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>{cancelButton}</AlertDialogCancel>
          {proceedButton}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
