import { contextBridge, ipcRenderer } from 'electron'

import type { GetOrdersReportRequest, GetOrdersReportResponse } from '../controllers/reports-controller'

export interface ReportsApi {
  getOrdersReport: (data: GetOrdersReportRequest) => Promise<GetOrdersReportResponse>
}

export const apiName = 'reportsApi'

const api = {
  getOrdersReport: async (data) => await ipcRenderer.invoke('reports:orders', data),
} satisfies ReportsApi

export function reportsApi() {
  contextBridge.exposeInMainWorld(apiName, api)
}
