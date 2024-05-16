import React, { type ReactNode } from 'react'

import { Toaster } from '@/view/components/ui/toaster'

interface ToastContextProps {
  children: ReactNode
}

export const ToastContext = ({ children }: ToastContextProps) => {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
}
