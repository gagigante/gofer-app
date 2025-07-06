import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/view/components/ui/tooltip'
import { Button } from '@/view/components/ui/button'

interface ActionButtonProps {
  variant: 'destructive' | 'outline'
  icon: React.ReactNode
  tooltip: string
  customLoading?: boolean
  onClick: () => void | Promise<void>
  disabled?: boolean
}

export function TableActionButton({
  onClick,
  icon,
  variant,
  tooltip,
  customLoading = false,
  disabled = false,
}: ActionButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          onClick={async () => {
            setIsLoading(true)
            await onClick()
            setIsLoading(false)
          }}
          disabled={isLoading || customLoading || disabled}
        >
          {isLoading || customLoading ? <Loader2 className="animate-spin w-3 h-3" /> : icon}
        </Button>
      </TooltipTrigger>

      <TooltipContent>
        <p>{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  )
}
