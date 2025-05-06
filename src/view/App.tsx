import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { TooltipProvider } from '@/view/components/ui/tooltip'
import { ReactQueryContext } from './contexts/ReactQueryContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastContext } from './contexts/ToastContext'
import { AuthProvider } from './contexts/AuthContext'
import { router } from './routes'

import '@/view/styles/global.css'

const container = document.getElementById('root')!
const root = createRoot(container)

root.render(
  <ReactQueryContext>
    <ThemeProvider>
      <TooltipProvider>
        <ToastContext>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </ToastContext>
      </TooltipProvider>
    </ThemeProvider>
  </ReactQueryContext>,
)
