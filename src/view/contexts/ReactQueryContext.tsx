import React, { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface ReactQueryContextProps {
  children: ReactNode
}

const queryClient = new QueryClient()

export function ReactQueryContext({ children }: ReactQueryContextProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
