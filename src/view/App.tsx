import React from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { AuthProvider } from './contexts/AuthContext'
import { ToastContext } from './contexts/ToastContext'
import { router } from './routes'

import '@/view/styles/global.css'

const divElement = document.getElementById('root')!
const root = createRoot(divElement)

root.render(
  <ToastContext>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </ToastContext>,
)
