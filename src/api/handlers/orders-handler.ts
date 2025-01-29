import { app, BrowserWindow, dialog, ipcMain } from 'electron'
import { writeFile } from 'node:fs/promises'

import {
  type CreateOrderRequest,
  type DeleteOrderRequest,
  type GetOrderRequest,
  type GetOrderTemplateRequest,
  type ListOrdersRequest,
  OrdersController,
} from '../controllers/orders-controller'

import { FailToGenerateFileError } from '../errors/FailToGenerateFileError'

import type { Response } from '../types/response'

const ordersController = new OrdersController()

ipcMain.handle('orders:list', async (_event, data: ListOrdersRequest) => await ordersController.listOrders(data))

ipcMain.handle('orders:get', async (_event, data: GetOrderRequest) => await ordersController.getOrder(data))

ipcMain.handle('orders:create', async (_event, data: CreateOrderRequest) => await ordersController.createOrder(data))

ipcMain.handle('orders:delete', async (_event, data: DeleteOrderRequest) => await ordersController.deleteOrder(data))

export const ordersHandler = (window: BrowserWindow) => {
  ipcMain.handle(
    'orders:download-file',
    async (_event, data: GetOrderTemplateRequest): Promise<Response<{ is_canceled: boolean }>> => {
      const { data: response, err } = await ordersController.getOrderTemplate(data)

      if (err) {
        return { data: null, err: new FailToGenerateFileError() }
      }

      const printWindow = new BrowserWindow({ show: false })

      try {
        await printWindow.loadURL(`data:text/html;charset=UTF-8,${encodeURIComponent(response.template)}`)
      } catch {
        return { data: null, err: new FailToGenerateFileError() }
      }

      let documentsDir = ''

      try {
        documentsDir = app.getPath('documents')
      } catch {
        return { data: null, err: new FailToGenerateFileError() }
      }

      const reducedOrderId = response.order.id.split('-')[0]
      const { filePath, canceled } = await dialog.showSaveDialog(window, {
        defaultPath: `${documentsDir}/pedido-${reducedOrderId}.pdf`,
        message: 'Salvar comprovante de vend',
        showsTagField: false,
        properties: ['createDirectory', 'showOverwriteConfirmation', 'dontAddToRecent'],
      })

      if (canceled) return { data: { is_canceled: true }, err: null }

      try {
        const pdfBuffer = await printWindow.webContents.printToPDF({
          pageSize: 'A4',
          landscape: false,
          displayHeaderFooter: false,
        })

        await writeFile(filePath, pdfBuffer)

        return { data: { is_canceled: false }, err: null }
      } catch {
        return { data: null, err: new FailToGenerateFileError() }
      }
    },
  )
}
