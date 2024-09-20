import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { ReactQueryContext } from './contexts/ReactQueryContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ToastContext } from './contexts/ToastContext'
import { AuthProvider } from './contexts/AuthContext'
import { router } from './routes'

import '@/view/styles/global.css'

const divElement = document.getElementById('root')!
const root = createRoot(divElement)

root.render(
  <ReactQueryContext>
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <ToastContext>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ToastContext>
    </ThemeProvider>
  </ReactQueryContext>,
)
