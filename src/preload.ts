// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { loginApi } from './api/exposes/login-api'
import { usersApi } from './api/exposes/users-api'

loginApi()
usersApi()
