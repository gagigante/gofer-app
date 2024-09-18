import React from 'react'
import { createHashRouter } from 'react-router-dom'

import { Login } from '@/view/pages/Login'
import { Home } from '@/view/pages/Home'
import { Users } from '@/view/pages/Users'
import { NotFound } from '@/view/pages/404'
import { Layout } from '@/view/components/Layout'
import { ProtectedRoute } from './ProtectedRoute'

export const router = createHashRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'users',
        element: <Users />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])
