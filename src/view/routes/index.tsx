import { createHashRouter } from 'react-router-dom'

import { Login } from '@/view/pages/Login'
import { Reports } from '@/view/pages/Reports'
import { Users } from '@/view/pages/Users'
import { Budgets } from '@/view/pages/Budgets'
import { Orders } from '@/view/pages/Orders'
import { OrderDetails } from '@/view/pages/OrderDetails'
import { CreateOrder } from '@/view/pages/CreateOrder'
import { CategoryDetails } from '@/view/pages/CategoryDetails'
import { BrandDetails } from '@/view/pages/BrandDetails'
import { CreateCustomer } from '@/view/pages/CreateCustomer'
import { UpdateCustomer } from '@/view/pages/UpdateCustomer'
import { Customers } from '@/view/pages/Customers'
import { CustomerDetails } from '../pages/CustomerDetails'
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
        element: <Reports />,
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
        path: 'orders/:order_id',
        element: <OrderDetails />,
      },
      {
        path: 'budgets',
        element: <Budgets />,
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
        path: 'customers/:customer_id',
        element: <CustomerDetails />,
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
        path: 'products/categories/:category_id',
        element: <CategoryDetails />,
      },
      {
        path: 'products/brands/:brand_id',
        element: <BrandDetails />,
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
