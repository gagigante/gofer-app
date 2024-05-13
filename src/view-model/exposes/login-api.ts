import { contextBridge, ipcRenderer } from 'electron'

import { type LoginData } from '@/view-model/handlers/login-handlers'

export function loginApi() {
  contextBridge.exposeInMainWorld('loginApi', {
    login: async ({ name, password }: LoginData) => await ipcRenderer.invoke('login', { name, password }),
  })
}
