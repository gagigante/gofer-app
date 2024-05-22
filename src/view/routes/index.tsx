import React from 'react'
import { createBrowserRouter } from 'react-router-dom'

import { ProtectedRoute } from './ProtectedRoute'
import { Login } from '@/view/pages/Login'
import { Home } from '@/view/pages/Home'
import { Users } from '@/view/pages/Users'
import { Layout } from '../components/Layout'

export const router = createBrowserRouter([
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
    ],
  },
])
