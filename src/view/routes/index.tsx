import { createHashRouter } from 'react-router-dom'

import { Login } from '@/view/pages/Login'
import { Home } from '@/view/pages/Home'
import { Users } from '@/view/pages/Users'
import { Orders } from '@/view/pages/Orders'
import { CreateOrder } from '@/view/pages/CreateOrder'
import { CreateCustomer } from '@/view/pages/CreateCustomer'
import { UpdateCustomer } from '@/view/pages/UpdateCustomer'
import { Customers } from '@/view/pages/Customers'
import { Products } from '@/view/pages/Products'
import { CreateProduct } from '@/view/pages/CreateProduct'
import { UpdateProduct } from '@/view/pages/UpdateProduct'
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
        path: 'orders',
        element: <Orders />,
      },
      {
        path: 'orders/new',
        element: <CreateOrder />,
      },
      {
        path: 'customers',
        element: <Customers />,
      },
      {
        path: 'customers/new',
        element: <CreateCustomer />,
      },
      {
        path: 'customers/update',
        element: <UpdateCustomer />,
      },
      {
        path: 'products',
        element: <Products />,
      },
      {
        path: 'products/new',
        element: <CreateProduct />,
      },
      {
        path: 'products/update',
        element: <UpdateProduct />,
      },
      {
        path: '*',
        element: <NotFound />,
      },
    ],
  },
])
