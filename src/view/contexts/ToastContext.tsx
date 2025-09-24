import { type ReactNode } from 'react'

import { Toaster } from '@/view/components/ui/sonner'

interface ToastContextProps {
  children: ReactNode
}

export const ToastContext = ({ children }: ToastContextProps) => {
  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  )
}
