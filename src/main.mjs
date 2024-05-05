import { app, BrowserWindow } from 'electron'
import path from 'node:path'

import './db/index.mjs'
import './db/index.mjs'

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(path.resolve(), 'preload.js')
    }
  })

  win.loadFile('src/index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})