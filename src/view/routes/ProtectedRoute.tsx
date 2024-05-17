import React, { type ReactNode } from 'react'
import { Navigate } from 'react-router-dom'

import { useAuth } from '@/view/hooks/useAuth'

interface ProtectedRouteProps {
  children: ReactNode
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/" replace />
  }

  return children
}
