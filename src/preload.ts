// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { loginApi } from './api/exposes/login-api'
import { usersApi } from './api/exposes/users-api'
import { categoriesApi } from './api/exposes/categories-api'
import { productsApi } from './api/exposes/products-api'
import { ordersApi } from './api/exposes/orders-api'

loginApi()
usersApi()
categoriesApi()
productsApi()
ordersApi()
