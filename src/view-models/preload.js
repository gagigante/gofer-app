const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('login', {
  login: (data) => ipcRenderer.invoke('login', data)
})

contextBridge.exposeInMainWorld('electronAPI', {
  setTitle: (title) => ipcRenderer.send('set-title', title)
})