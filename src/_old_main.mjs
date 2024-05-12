import { app, BrowserWindow, ipcMain } from 'electron/main'
import path from 'node:path'

import { db } from './data/db/index.mjs'
import { UsersRepository } from './data/repositories/users-repository.mjs'
import { LoginController } from './view-models/controllers/login-controller.mjs'

let loggedUser = undefined

function createWindow () {
  const INITIAL_TEMPLATE_PATH = 'src/ui/templates/login.html'
  const PRELOAD_FILE_PATH = 'src/view-models/preload.js'

  const browserWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(process.cwd(), PRELOAD_FILE_PATH)
    }
  })
   
  browserWindow.loadFile(INITIAL_TEMPLATE_PATH)

  return browserWindow
}

app.whenReady().then(() => {
  const window = createWindow()

  ipcMain.handle('login', async (_event, data) => {
    const loginController = new LoginController()
    
    const { user, password } = data
    const response = await loginController.login(user, password)
    
    if (response.data) {
      loggedUser = response.data

      window.loadFile('src/ui/templates/home.html')
    } else {
      return null
    }
  })

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
