import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

interface ReactQueryContextProps {
  children: ReactNode
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
    },
  },
})

export function ReactQueryContext({ children }: ReactQueryContextProps) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
