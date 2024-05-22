import React, { type ReactNode } from 'react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/view/components/ui/alert-dialog'

interface DialogProps {
  title: string
  description: string
  children: ReactNode
  cancelButton: ReactNode
  proceedButton: ReactNode
}

export function Dialog({ children, title, description, cancelButton, proceedButton }: DialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>{cancelButton}</AlertDialogCancel>
          {proceedButton}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
