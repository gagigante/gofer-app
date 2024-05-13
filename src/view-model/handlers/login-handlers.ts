import { ipcMain } from 'electron'

import { LoginController } from '@/view-model/controllers/login-controller'

const loginController = new LoginController()

export interface LoginData {
  name: string
  password: string
}

ipcMain.handle('login', async (_event, data: LoginData) => await loginController.login(data.name, data.password))

export {}
