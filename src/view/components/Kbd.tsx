import { type ReactNode } from 'react'
import { cn } from '../lib/utils'

interface KbdProps {
  children: ReactNode
  className?: string
}

export const Kbd = ({ children, className = '' }: KbdProps) => {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center px-1 py-0 mx-[0.25rem] text-[10px] font-mono font-medium text-foreground bg-background border border-border rounded-md shadow-sm',
        className,
      )}
    >
      {children}
    </span>
  )
}
