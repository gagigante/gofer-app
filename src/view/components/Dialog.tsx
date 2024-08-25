import React, { type ReactNode } from 'react'
import {
  Dialog as ShadDialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/view/components/ui/dialog'
import { Button } from '@/view/components/ui/button'

interface DialogProps {
  open: boolean
  title: string
  description?: string
  children?: ReactNode
  proceedButtonLabel: string
  onProceed: () => Promise<void>
  onClose: () => void
}

export function Dialog({ open, children, title, description, proceedButtonLabel, onProceed, onClose }: DialogProps) {
  return (
    <ShadDialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children && <div>{children}</div>}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </DialogClose>

          <Button
            type="button"
            variant="default"
            onClick={async () => {
              await onProceed()
            }}
          >
            {proceedButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </ShadDialog>
  )
}
