import React from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { Login } from '@/view/pages/Login'

export const router = createBrowserRouter([
  {
    id: 'root',
    path: '/',
    element: <Login />,
  },
])
