import { useState } from 'react'
import { type LucideIcon, ChevronDown } from 'lucide-react'

import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/view/components/ui/dropdown-menu'

import { cn } from '@/view/lib/utils'

type BadgeSelectProps = {
  options: Array<{
    label: string
    value: string
    icon: LucideIcon
    className?: string
  }>
  value?: string
  onChange?: (value: string) => void
}

export function BadgeSelect({ options, value, onChange }: BadgeSelectProps) {
  const [open, setOpen] = useState(false)

  if (options.length === 0) return null

  const selectedStatus = options.find((item) => item.value === value) ?? options[0]

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button className="gap-2" variant="ghost" size="sm">
          <selectedStatus.icon className={cn('w-4 h-4', selectedStatus.className)} />
          <span className="font-light text-sm text-foreground">{selectedStatus.label}</span>
          <ChevronDown className="w-4 h-4 text-accent-foreground/50" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start">
        {options.map((status) => (
          <DropdownMenuItem key={status.value} onClick={() => onChange?.(status.value)}>
            <status.icon className={cn('w-4 h-4', status.className)} />
            <span className="text-sm text-foreground">{status.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
