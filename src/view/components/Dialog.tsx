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
  className?: string
  open: boolean
  title: string
  description?: string
  children?: ReactNode
  proceedButtonLabel: string
  cancelButtonLabel?: string
  isProceedButtonDisabled?: boolean
  onProceed: () => Promise<void> | void
  onClose: () => void
}

export function Dialog({
  className,
  open,
  children,
  title,
  description,
  proceedButtonLabel,
  cancelButtonLabel = 'Cancelar',
  isProceedButtonDisabled = false,
  onProceed,
  onClose,
}: DialogProps) {
  return (
    <ShadDialog
      open={open}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <DialogContent className={className} aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        {children && <div className="flex-1 max-h-[480px] mx-[-1.5rem] p-6 overflow-auto">{children}</div>}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={onClose}>
              {cancelButtonLabel}
            </Button>
          </DialogClose>

          <Button
            type="button"
            variant="default"
            onClick={async () => {
              await onProceed()
            }}
            disabled={isProceedButtonDisabled}
          >
            {proceedButtonLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </ShadDialog>
  )
}
