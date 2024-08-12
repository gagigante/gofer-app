import React, { type ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogTrigger,
} from '@/view/components/ui/alert-dialog'

interface DialogProps {
  title: string
  description?: string
  trigger: ReactNode
  cancelButton: ReactNode
  proceedButton: ReactNode
}

export function Alert({ title, trigger, description, cancelButton, proceedButton }: DialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>{cancelButton}</AlertDialogCancel>
          <AlertDialogAction asChild>{proceedButton}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
