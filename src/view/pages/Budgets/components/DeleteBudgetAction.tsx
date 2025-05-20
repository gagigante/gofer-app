import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/view/components/ui/button'
import { Alert } from '@/view/components/Alert'

interface DeleteBudgetActionProps {
  isOpen: boolean
  onDelete: () => Promise<void>
  onClose: () => void
}

export function DeleteBudgetAction({ isOpen, onDelete, onClose }: DeleteBudgetActionProps) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Alert
      isOpen={isOpen}
      title="Apagar orçamento"
      description="Deseja mesmo apagar este orçamento?"
      cancelButton={
        <Button variant="outline" disabled={isLoading}>
          Cancelar
        </Button>
      }
      proceedButton={
        <Button
          variant="destructive"
          disabled={isLoading}
          onClick={async () => {
            setIsLoading(true)
            await onDelete()
            setIsLoading(false)
          }}
        >
          {isLoading && <Loader2 className="animate-spin w-4 h-4 mr-2" />}
          Apagar
        </Button>
      }
      onClose={onClose}
    />
  )
}
