import { contextBridge, ipcRenderer } from 'electron'

export function loginApi() {
  contextBridge.exposeInMainWorld('loginApi', {
    login: async ({ name, password }: { name: string; password: string }) =>
      await ipcRenderer.invoke('login', { name, password }),
  })
}
