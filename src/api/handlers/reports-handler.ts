import { ipcMain } from 'electron'

import { GetOrdersReportRequest, ReportsController } from '../controllers/reports-controller'

const reportsController = new ReportsController()

ipcMain.handle(
  'reports:orders',
  async (_event, data: GetOrdersReportRequest) => await reportsController.getOrdersReport(data),
)

export {}
