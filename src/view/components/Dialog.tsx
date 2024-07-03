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
  description?: string
  trigger: ReactNode
  children?: ReactNode
  cancelButton: ReactNode
  proceedButton: ReactNode
}

export function Dialog({ children, title, trigger, description, cancelButton, proceedButton }: DialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        {children && <div>{children}</div>}
        <AlertDialogFooter>
          <AlertDialogCancel asChild>{cancelButton}</AlertDialogCancel>
          {proceedButton}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
