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

interface RemoveProductFromBrandActionProps {
  isOpen: boolean
  onRemove: () => Promise<void>
  onClose: () => void
}

export const RemoveProductFromBrandAction = ({ isOpen, onRemove, onClose }: RemoveProductFromBrandActionProps) => {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent onKeyDown={(e) => e.stopPropagation()}>
        <AlertDialogHeader>
          <AlertDialogTitle>Remover produto desta marca</AlertDialogTitle>
          <AlertDialogDescription>
            Deseja mesmo remover este produto desta marca? Ao remover o produto, ele deixará de ser associado a esta
            marca.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" disabled={isLoading} onClick={onClose} autoFocus>
            Cancelar
          </Button>

          <Button
            onClick={async () => {
              setIsLoading(true)
              await onRemove()
              onClose()
              setIsLoading(false)
            }}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 w-4 h-4 animate-spin" />}
            Remover
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
