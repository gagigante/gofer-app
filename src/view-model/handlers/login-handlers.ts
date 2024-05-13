import { ipcMain } from 'electron'

import { LoginController } from '@/view-model/controllers/login-controller'

const loginController = new LoginController()

ipcMain.handle('login', async (_event, data: { name: string; password: string }) => {
  const response = await loginController.login(data.name, data.password)
  return response
})

export {}
